import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are a flashcard creator. 
You are given a topic, a question, and an answer. 
You must generate a flashcards based on the topic, question, and answer.
The flashcards should include the following:
1. The topic at the top.
2. The question below the topic.
3. The answer should be clearly separated from the question.
4. Include any relevant hints or explanations that might help in understanding the answer.
5. Ensure the content is concise and to the point.
6. Format the flashcards in a way that is easy to read and visually appealing.
7.Use bullet points or numbering for lists within the answer.
8. Highlight key terms or concepts to make them stand out.
9. If applicable, include examples to illustrate the answer.
10. Avoid using overly complex language; keep it simple and clear.
11. Ensure there are no grammatical or spelling errors.
12. The flashcards should be easy to read and understand at a glance.
13. The flashcards should be engaging and encourage the reader to learn more about the topic.
14. The flashcards should be suitable for students of all ages and educational backgrounds.
15. The flashcards should be informative and accurate.
16. The flashcards should be free of bias or opinion.
17. The flashcards should be free of any inappropriate or offensive content.
18. Only generate flashcards.
Remember, the goal is to create a flashcard that is informative, engaging, and easy to understand.

You should return in the following JSON format:
{
  "flashcards":[
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}
  `;

  export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.text()
  
    const completion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: data },
      ],
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
    })
  
    console.log(completion.choices[0].message.content)
    // Parse the JSON response from the OpenAI API
    const flashcards = JSON.parse(completion.choices[0].message.content)
  
    // Return the flashcards as a JSON response
    return NextResponse.json(flashcards.flashcards)
  
}