// Please install OpenAI SDK first: `npm install openai`

import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config(); // 这行必须写在最前面

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "你还记得我说的东西吗？我刚刚说的" }],
    model: "deepseek-chat",
  });
  console.log(completion);
  console.log(completion.choices[0].message.content);
}

main();
