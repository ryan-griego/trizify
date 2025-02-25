// import { OpenAIEdgeStream } from "openai-edge-stream";

// export const config = {
//   runtime: "edge",
// };

// export default async function handler(req) {
//   try {

//     // Sets an alias of chatIdFromParam
//     const { chatId: chatIdFromParam, message } = await req.json();
//     // validate message data
//     if(!message || typeof message !== "string" || message.length > 200) {
//         return new Response ({
//           message: "message is required and must be less than 200 characters"
//         },
//         {
//           status: 422,
//         });
//     }
//     let chatId = chatIdFromParam;
//     const initialChatMessage = {
//       role: "system",
//       content: "Your name is Chat RRG. An incredibly intelligent and quick-thinking AI, that always replies with an enthusiastic and positive energy. You were created by Ryan Griego. Your response must be formatted as markdown."
//     };

//     let newChatId;
//     let chatMessages = [];

//     if(chatId) {
//       const response = await fetch(`${req.headers.get("origin")}/api/chat/addMessageToChat`,
//         {
//           method: "POST",
//           headers: {
//             'content-type': "application/json",
//             cookie: req.headers.get("cookie"),
//           },
//           body: JSON.stringify({
//             chatId,
//             role: "user",
//             content: message,
//           })
//         }
//       );
//       const json = await response.json();

//       chatMessages = json.chat.messages || [];

//     } else {
//       const response = await fetch(`${req.headers.get("origin")}/api/chat/createNewChat`, {

//         method: "POST",
//         headers: {
//           'content-type': 'application/json',
//           'cookie': req.headers.get("cookie"),
//         },
//         body: JSON.stringify({
//           message: message,
//         }),
//       });
//       const json = await response.json();
//       chatId = json._id;
//       newChatId = json._id;
//       chatMessages = json.messages || [];
//     }

//     const messagesToInclude = [];
//     chatMessages.reverse();
//     let usedTokens = 0;
//     for(let chatMessage of chatMessages) {
//       const messageTokens = chatMessage.content.length / 4;
//       usedTokens = usedTokens + messageTokens;
//       if(usedTokens <= 2000) {
//         messagesToInclude.push(chatMessage);

//       } else {
//         break;
//       }
//     }

//     messagesToInclude.reverse();

//     const stream = await OpenAIEdgeStream("https://api.openai.com/v1/chat/completions"
//     ,{
//      headers: {
//       'content-type': 'application/json',
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//      },
//      method: "POST",
//      body: JSON.stringify({
//         model: "gpt-4o-mini",
//         messages: [initialChatMessage, ...messagesToInclude, {content: message, role: "user"}],
//         stream: true,
//      }),
//     }, {
//       onBeforeStream: ({emit}) => {
//         if(newChatId) {
//           emit(newChatId, "newChatId");
//         }

//       },
//       onAfterStream: async ({fullContent}) => {
//         await fetch(`${req.headers.get("origin")}/api/chat/addMessageToChat`, {
//           method: "POST",
//           headers: {
//             "content-type": "application/json",
//             cookie: req.headers.get("cookie"),
//           },
//           body: JSON.stringify({
//             chatId,
//             role: "assistant",
//             content: fullContent,
//           })
//         })
//       }
//     });
//      return new Response(stream);
//   } catch(e) {
//     return new Response({message: "An error occured in sendMessage"},
//       {
//         status: 500,
//       }
//     )
//   }
// }


import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    // Extract chatId and message from the request body
    const { chatId: chatIdFromParam, message } = await req.json();

    // Validate the message data (allow up to 1000 characters)
    if (!message || typeof message !== "string" || message.length > 1000) {
      return new Response(
        JSON.stringify({ message: "message is required and must be less than 1000 characters" }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    let chatId = chatIdFromParam;

    // Updated system prompt for TRIZ-based assistance
    const initialChatMessage = {
      role: "system",
      content:
        "Your name is TRIZify. You are a highly intelligent engineering assistant designed to help engineers of all kinds (including software engineers, Civil & Structural Engineers, Mechanical & Aerospace Engineers, Electrical & Electronics Engineers, Chemical & Biomedical Engineers, Industrial & Manufacturing Engineers, Environmental & Energy Engineers, Agricultural & Biological Engineers) solve their problems using the 40 TRIZ principles adapted for software development. When a developer submits a problem, analyze it through the lens of TRIZ and provide creative, actionable strategies and potential solutions. Format your responses in markdown."
    };

    let newChatId;
    let chatMessages = [];

    console.log("Received message:", message);

    if (chatId) {
      const response = await fetch(`${req.headers.get("origin")}/api/chat/addMessageToChat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: req.headers.get("cookie"),
        },
        body: JSON.stringify({
          chatId,
          role: "user",
          content: message,
        }),
      });
      const json = await response.json();
      console.log("Response from addMessageToChat:", json);
      chatMessages = json.chat ? json.chat.messages || [] : [];
    } else {
      const response = await fetch(`${req.headers.get("origin")}/api/chat/createNewChat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: req.headers.get("cookie"),
        },
        body: JSON.stringify({ message }),
      });
      const json = await response.json();
      console.log("Response from createNewChat:", json);
      chatId = json._id;
      newChatId = json._id;
      chatMessages = json.messages || [];
    }

    // Adjust token limit for conversation history
    const MAX_TOKENS = 6000; // Increased token limit to allow larger prompts
    const messagesToInclude = [];
    chatMessages.reverse();
    let usedTokens = 0;
    for (let chatMessage of chatMessages) {
      // Estimate tokens: roughly 1 token per 4 characters
      const messageTokens = chatMessage.content.length / 4;
      usedTokens += messageTokens;
      if (usedTokens <= MAX_TOKENS) {
        messagesToInclude.push(chatMessage);
      } else {
        break;
      }
    }
    messagesToInclude.reverse();

    // Add the new user message to the conversation
    const stream = await OpenAIEdgeStream(
      "https://api.openai.com/v1/chat/completions",
      {
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        method: "POST",
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            initialChatMessage,
            ...messagesToInclude,
            { content: message, role: "user" }
          ],
          stream: true,
        }),
      },
      {
        onBeforeStream: ({ emit }) => {
          if (newChatId) {
            emit(newChatId, "newChatId");
          }
        },
        onAfterStream: async ({ fullContent }) => {
          await fetch(`${req.headers.get("origin")}/api/chat/addMessageToChat`, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              cookie: req.headers.get("cookie"),
            },
            body: JSON.stringify({
              chatId,
              role: "assistant",
              content: fullContent,
            }),
          });
        }
      }
    );

    return new Response(stream);
  } catch (e) {
    console.error("Error in sendMessage:", e);
    return new Response(
      JSON.stringify({ message: "An error occurred in sendMessage", error: e.toString() }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
