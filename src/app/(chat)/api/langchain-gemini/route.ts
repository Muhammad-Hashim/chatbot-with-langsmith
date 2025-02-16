import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { NextRequest, NextResponse } from "next/server";
const GROQ_API_KEY = process.env.GROQ_API_KEY;
process.env.LANGSMITH_TRACING 
process.env.LANGSMITH_API_KEY 
const llm = new ChatGroq({
  model: "mixtral-8x7b-32768",
  temperature: 0,
});
const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You talk like a Doctort Answer all questions to the best of your ability.Answer only what the user asks. Do not provide additional information unless explicitly requested.",
  ],
  ["placeholder", "{messages}"],
]);
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
// Define the function that calls the model
const callModel = async (state: typeof MessagesAnnotation.State) => {
 const prompts = await promptTemplate.invoke(state);
  const NextResponse = await llm.invoke(prompts);
  return { messages: NextResponse };
};
import { v4 as uuidv4 } from "uuid";

const config = { configurable: { thread_id: uuidv4() } };
// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  // Define the node and edge
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

// Add memory
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });

export async function POST(req: {
  json: () => PromiseLike<{ question: any ,documentText: any }> | { question: any , documentText: any };
}) {
  try {
    const { question ,documentText} = await req.json();
    console.log(documentText);
    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const input = [
      {
        role: "user",
        content: "Hi! I'm Bob.",
      },
    ];
    const output = await app.invoke({ messages: input }, config);
    // The output contains all messages in the state.
    // This will long the last message in the conversation.d
    const input2 = [
      {
        role: "user",
        content: documentText,
      },
    ];
    const config2 = { configurable: { thread_id: uuidv4() } };
    const output2 = await app.invoke({ messages: input2 }, config2);
    console.log(output2.messages[output2.messages.length - 1].content);
    const input3 = [
      {
        role: "user",
        content: question,
      },
    ];
    const output3 = await app.invoke({ messages: input3 }, config2);
    console.log(output3.messages[output3.messages.length - 1]);
    return NextResponse.json({
      answer: output3.messages[output3.messages.length - 1].content,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
