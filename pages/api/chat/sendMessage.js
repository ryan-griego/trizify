import { OpenAIEdgeStream } from "openai-edge-stream";

export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    // Sets an alias of chatIdFromParam
    const { chatId: chatIdFromParam, message } = await req.json();
    let chatId = chatIdFromParam;
    console.log("MESSAGE: ", message);
    const initialChatMessage = {
      role: "system",
      content: "Your name is Chat RRG. An incredibly intelligent and quick-thinking AI, that always replies with an enthusiastic and positive energy. You were created by Ryan Griego. Your response must be formatted as markdown."
    };

    let newChatId;
    let chatMessages = [];

    if(chatId) {
      // add message to chat
      const response = await fetch(`${req.headers.get("origin")}/api/chat/addMessageToChat`,
        {
          method: "POST",
          headers: {
            'content-type': "application/json",
            cookie: req.headers.get("cookie"),
          },
          body: JSON.stringify({
            chatId,
            role: "user",
            content: message,
          })
        }
      );
      const json = await response.json();
      chatMessages = json.chat.messages || [];

    } else {
      const response = await fetch(`${req.headers.get("origin")}/api/chat/createNewChat`, {

        method: "POST",
        headers: {
          'content-type': 'application/json',
          'cookie': req.headers.get("cookie"),
        },
        body: JSON.stringify({
          message: message,
        }),
      });
      const json = await response.json();
      newChatId = json._id;
      chatMessages = json.messages || [];
    }

    const messagesToInclude = [];
    chatMessages.reverse();
    let usedTokens = 0;
    for(let chatMessage of chatMessages) {
      const messageTokens = chatMessage.content.length / 4;
      usedTokens = usedTokens + messageTokens;
      if(usedTokens <= 2000) {
        messagesToInclude.push(chatMessage);

      } else {
        break;
      }
    }

    messagesToInclude.reverse();

    const stream = await OpenAIEdgeStream("https://api.openai.com/v1/chat/completions"
    ,{
     headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
     },
     method: "POST",
     body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [initialChatMessage, ...messagesToInclude, {content: message, role: "user"}],
        stream: true,
     }),
    }, {
      onBeforeStream: ({emit}) => {
        if(newChatId) {
          emit(newChatId, "newChatId");
        }

      },
      onAfterStream: async ({fullContent}) => {
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
          })
        })
      }
    });
     return new Response(stream);
  } catch(e) {
    console.log("log the error", e);
  }
}
