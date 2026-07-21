-- Prevent students from downloading answer keys before submitting.
drop policy if exists "authenticated reads exams" on public.exams;
drop policy if exists "admin reads exams" on public.exams;
create policy "admin reads exams" on public.exams for select to authenticated using (public.is_admin());

create or replace function public.strip_exam_answers(source jsonb)
returns jsonb language plpgsql immutable as $$
declare
  result jsonb := source;
  question jsonb;
  clean_questions jsonb := '[]'::jsonb;
  clean_options jsonb;
  clean_statements jsonb;
begin
  clean_questions := '[]'::jsonb;
  for question in select value from jsonb_array_elements(coalesce(source#>'{data,part1_multipleChoice}', '[]'::jsonb)) loop
    select coalesce(jsonb_agg(value - 'isCorrect'), '[]'::jsonb) into clean_options
    from jsonb_array_elements(coalesce(question->'options', '[]'::jsonb));
    clean_questions := clean_questions || jsonb_build_array(jsonb_set(question, '{options}', clean_options));
  end loop;
  result := jsonb_set(result, '{data,part1_multipleChoice}', clean_questions, true);

  clean_questions := '[]'::jsonb;
  for question in select value from jsonb_array_elements(coalesce(source#>'{data,part2_trueFalse}', '[]'::jsonb)) loop
    select coalesce(jsonb_agg(value - 'isTrue'), '[]'::jsonb) into clean_statements
    from jsonb_array_elements(coalesce(question->'statements', '[]'::jsonb));
    clean_questions := clean_questions || jsonb_build_array(jsonb_set(question, '{statements}', clean_statements));
  end loop;
  result := jsonb_set(result, '{data,part2_trueFalse}', clean_questions, true);

  select coalesce(jsonb_agg(value - 'correctAnswer'), '[]'::jsonb) into clean_questions
  from jsonb_array_elements(coalesce(source#>'{data,part3_shortAnswer}', '[]'::jsonb));
  result := jsonb_set(result, '{data,part3_shortAnswer}', clean_questions, true);
  return result;
end $$;

create or replace function public.get_student_exams()
returns table(id text, title text, payload jsonb)
language sql stable security definer set search_path = public
as $$ select e.id, e.title, strip_exam_answers(e.payload) from exams e where e.published and auth.uid() is not null $$;
grant execute on function public.get_student_exams() to authenticated;

create or replace function public.submit_exam(p_exam_id text, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare exam_payload jsonb;
begin
  if auth.uid() is null then raise exception 'Unauthorized'; end if;
  select payload into exam_payload from exams where id = p_exam_id and published;
  if exam_payload is null then raise exception 'Exam not found'; end if;
  -- Returning the key only after submission keeps it out of the initial exam payload.
  return jsonb_build_object('data', exam_payload->'data');
end $$;
grant execute on function public.submit_exam(text, jsonb) to authenticated;

drop policy if exists "self updates progress" on public.lesson_progress;
create policy "self updates progress" on public.lesson_progress for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
