import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, '..', 'exams');
const outputDir = path.join(__dirname, '..', 'public', 'images', 'exams');
const outputJson = path.join(__dirname, '..', 'public', 'data', 'exams.json');

// Ensure image directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Ensure exams directory exists
if (!fs.existsSync(inputDir)) {
  fs.mkdirSync(inputDir, { recursive: true });
}

// Ensure data directory exists
const dataDir = path.dirname(outputJson);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function processImages(text) {
  const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
  let updatedText = text;
  let match;

  while ((match = imageRegex.exec(text)) !== null) {
    const altText = match[1];
    let imagePath = match[2];
    
    // Convert relative path from markdown to absolute path in exams dir
    const absoluteImagePath = path.resolve(inputDir, imagePath);

    // Copy image if it exists
    if (fs.existsSync(absoluteImagePath)) {
      const fileName = path.basename(absoluteImagePath);
      const destPath = path.join(outputDir, fileName);
      fs.copyFileSync(absoluteImagePath, destPath);
      
      // Replace path in text with relative path without leading slash
      updatedText = updatedText.replace(match[0], `![${altText}](/images/exams/${fileName})`);
    } else {
        console.warn(`Warning: Image not found at ${absoluteImagePath}`);
    }
  }
  return updatedText;
}

function parseFile(content) {
    const data = {
        part1_multipleChoice: [],
        part2_trueFalse: [],
        part3_shortAnswer: []
    };

    // Split into parts
    const p1Match = content.match(/## PHẦN I[\s\S]*?(?=## PHẦN II|## PHẦN III|$)/i);
    const p2Match = content.match(/## PHẦN II[\s\S]*?(?=## PHẦN III|$)/i);
    const p3Match = content.match(/## PHẦN III[\s\S]*?(?=$)/i);

    const p1Text = p1Match ? p1Match[0] : '';
    const p2Text = p2Match ? p2Match[0] : '';
    const p3Text = p3Match ? p3Match[0] : '';

    // Parse Part 1
    if (p1Text) {
        // Regex to match Câu X: followed by text and options
        const questionBlocks = p1Text.split(/\*\*Câu \d+[:.]\*\*/g).slice(1);
        questionBlocks.forEach((block, index) => {
            const lines = block.trim().split('\n').filter(l => l.trim().length > 0);
            if (lines.length < 5) return; // Need at least question + 4 options
            
            // The question might be multiline, so we find the first option line
            const firstOptionIndex = lines.findIndex(l => /^\*?[A-D]\./.test(l.trim()));
            if (firstOptionIndex === -1) return;

            const questionText = processImages(lines.slice(0, firstOptionIndex).join('\n').trim());
            const optionsLines = lines.slice(firstOptionIndex).join('\n');
            
            const options = [];
            const optionRegex = /(\*?)([A-D])\.\s+([\s\S]*?)(?=(?:\*?[A-D]\.)|$)/g;
            let optMatch;
            while((optMatch = optionRegex.exec(optionsLines)) !== null) {
                let optText = optMatch[3].trim();
                // Strip trailing ---
                optText = optText.replace(/---+$/, '').trim();
                options.push({
                    key: optMatch[2],
                    text: processImages(optText),
                    isCorrect: optMatch[1] === '*'
                });
            }

            data.part1_multipleChoice.push({
                id: `p1_q${index + 1}`,
                question: questionText,
                options: options
            });
        });
    }

    // Parse Part 2
    if (p2Text) {
        const questionBlocks = p2Text.split(/\*\*Câu \d+[:.]\*\*/g).slice(1);
        questionBlocks.forEach((block, index) => {
            // Find all statements a), b), c), d)
            const parts = block.split(/(?=[a-d]\))/);
            if(parts.length < 5) return; // need question + 4 statements

            const questionText = processImages(parts[0].trim());
            const statements = [];

            for(let i=1; i<parts.length; i++) {
                let stmtText = parts[i].trim();
                // Strip trailing ---
                stmtText = stmtText.replace(/---+$/, '').trim();

                let isTrue = false;
                if(stmtText.endsWith('*ĐÚNG')) {
                    isTrue = true;
                    stmtText = stmtText.substring(0, stmtText.length - 5).trim();
                } else if (stmtText.endsWith('*SAI')) {
                    isTrue = false;
                    stmtText = stmtText.substring(0, stmtText.length - 4).trim();
                }

                // remove the a) prefix
                const matchPrefix = stmtText.match(/^([a-d])\)\s*(.*)/);
                if (matchPrefix) {
                    statements.push({
                        id: matchPrefix[1],
                        text: processImages(matchPrefix[2].trim()),
                        isTrue: isTrue
                    });
                }
            }

            if (statements.length > 0) {
                data.part2_trueFalse.push({
                    id: `p2_q${index + 1}`,
                    question: questionText,
                    statements: statements
                });
            }
        });
    }

    // Parse Part 3
    if (p3Text) {
        const questionBlocks = p3Text.split(/\*\*Câu \d+[:.]\*\*/g).slice(1);
        questionBlocks.forEach((block, index) => {
            const lines = block.trim().split('\n').filter(l => l.trim().length > 0);
            const answerLineIndex = lines.findIndex(l => l.includes('*Đáp án:') || l.includes('Đáp án:'));
            
            if (answerLineIndex !== -1) {
                const questionText = processImages(lines.slice(0, answerLineIndex).join('\n').trim());
                let answerText = lines[answerLineIndex].replace(/^\*?Đáp án:\s*/, '').replace(/\*$/, '').trim();
                
                data.part3_shortAnswer.push({
                    id: `p3_q${index + 1}`,
                    question: questionText,
                    correctAnswer: answerText
                });
            }
        });
    }

    return data;
}

function toSlug(str) {
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

const quizzes = [];

fs.readdirSync(inputDir).forEach(file => {
    if (file.endsWith('.md') && file !== 'plan.md' && file !== 'README.md') {
        const content = fs.readFileSync(path.join(inputDir, file), 'utf8');
        const parsedData = parseFile(content);
        
        quizzes.push({
            id: file.replace('.md', ''),
            title: file.replace('.md', ''),
            slug: toSlug(file.replace('.md', '')),
            data: parsedData
        });
        console.log(`Parsed ${file}`);
    }
});

fs.writeFileSync(outputJson, JSON.stringify(quizzes, null, 2));
console.log(`Successfully generated ${outputJson}`);
