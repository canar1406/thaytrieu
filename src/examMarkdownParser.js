const emptyExam = () => ({
  part1_multipleChoice: [],
  part2_trueFalse: [],
  part3_shortAnswer: []
});

const cleanBlock = value => value.replace(/---+\s*$/, '').trim();

export const hasExamQuestions = data => data && [
  data.part1_multipleChoice,
  data.part2_trueFalse,
  data.part3_shortAnswer
].some(part => Array.isArray(part) && part.length > 0);

export const hasCompleteAnswerKey = data => {
  if (!hasExamQuestions(data)) return false;
  const part1Valid = (data.part1_multipleChoice || []).every(question =>
    question.options?.filter(option => option.isCorrect === true).length === 1
  );
  const part2Valid = (data.part2_trueFalse || []).every(question =>
    question.statements?.length && question.statements.every(statement => typeof statement.isTrue === 'boolean')
  );
  const part3Valid = (data.part3_shortAnswer || []).every(question =>
    String(question.correctAnswer ?? '').trim().length > 0
  );
  return part1Valid && part2Valid && part3Valid;
};

export function parseExamMarkdown(content) {
  const data = emptyExam();
  if (typeof content !== 'string' || !content.trim()) return data;

  const part1 = content.match(/##\s*PHẦN I\b[\s\S]*?(?=##\s*PHẦN II\b|##\s*PHẦN III\b|$)/i)?.[0] || '';
  const part2 = content.match(/##\s*PHẦN II\b[\s\S]*?(?=##\s*PHẦN III\b|$)/i)?.[0] || '';
  const part3 = content.match(/##\s*PHẦN III\b[\s\S]*$/i)?.[0] || '';

  part1.split(/\*\*Câu\s+\d+[:.]\*\*/gi).slice(1).forEach((block, index) => {
    const lines = block.trim().split(/\r?\n/).filter(line => line.trim());
    const firstOption = lines.findIndex(line => /^\s*\*?[A-D]\.\s+/.test(line));
    if (firstOption < 0) return;

    const optionsText = lines.slice(firstOption).join('\n');
    const options = [];
    const optionPattern = /(\*?)([A-D])\.\s+([\s\S]*?)(?=(?:\*?[A-D]\.\s+)|$)/g;
    let match;
    while ((match = optionPattern.exec(optionsText)) !== null) {
      options.push({
        key: match[2],
        text: cleanBlock(match[3]),
        isCorrect: match[1] === '*'
      });
    }
    if (options.length < 2) return;

    data.part1_multipleChoice.push({
      id: `p1_q${index + 1}`,
      question: lines.slice(0, firstOption).join('\n').trim(),
      options
    });
  });

  part2.split(/\*\*Câu\s+\d+[:.]\*\*/gi).slice(1).forEach((block, index) => {
    const pieces = block.split(/(?=[a-d]\))/);
    if (pieces.length < 2) return;

    const statements = pieces.slice(1).map(piece => {
      let statement = cleanBlock(piece);
      const prefix = statement.match(/^([a-d])\)\s*([\s\S]*)/);
      if (!prefix) return null;

      const answer = prefix[2].match(/\s*\*(ĐÚNG|SAI)\s*$/i);
      return {
        id: prefix[1],
        text: prefix[2].replace(/\s*\*(ĐÚNG|SAI)\s*$/i, '').trim(),
        isTrue: answer ? answer[1].toUpperCase() === 'ĐÚNG' : null
      };
    }).filter(Boolean);
    if (!statements.length) return;

    data.part2_trueFalse.push({
      id: `p2_q${index + 1}`,
      question: pieces[0].trim(),
      statements
    });
  });

  part3.split(/\*\*Câu\s+\d+[:.]\*\*/gi).slice(1).forEach((block, index) => {
    const lines = block.trim().split(/\r?\n/).filter(line => line.trim());
    const answerIndex = lines.findIndex(line => /^\s*\*?Đáp án:/i.test(line));
    if (answerIndex < 0) return;

    data.part3_shortAnswer.push({
      id: `p3_q${index + 1}`,
      question: lines.slice(0, answerIndex).join('\n').trim(),
      correctAnswer: lines[answerIndex].replace(/^\s*\*?Đáp án:\s*/i, '').replace(/\*\s*$/, '').trim()
    });
  });

  return data;
}
