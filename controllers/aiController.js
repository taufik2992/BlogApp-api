const { GoogleGenAI } = require("@google/genai");
const {
  blogPostIdeasPrompt,
  generateReplyPrompt,
  blogSummaryPrompt,
} = require("../utils/prompts");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

//@desc Generate Blog Content From title
//@route POST /api/ai/generate
//@access Private
const generateBlogPost = async (req, res) => {
  try {
    const { title, tone } = req.body;
    if (!title || !tone) {
      return res.status(400).json({ message: "Please provide title and tone" });
    }
    const prompt = `Write a markdown-formatted blog post titled "${title}".use a ${tone} tone. Include an introduction,subheadings,code example if relevant,and a conclusion.`;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });
    const blogContent = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!blogContent) {
      return res.status(500).json({
        message: "Failed to parse blog post content from model response",
        error: response,
      });
    }
    res.status(200).json({ content: blogContent });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate blog post",
      error: error.message,
    });
  }
};

//@desc generate Blog post ideas from title
//@route POST /api/ai/generate-ideas
//@access Private
const generateBlogPostIdeas = async (req, res) => {
  try {
    const { topics } = req.body;
    if (!topics) {
      return res.status(400).json({ message: "Please provide topics" });
    }
    const prompt = blogPostIdeasPrompt(topics);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: prompt,
    });
    const blogContent = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!blogContent) {
      return res.status(500).json({
        message: "Failed to parse blog post content from model response",
        error: response,
      });
    }
    //clean it : Remove ``` json and ``` from beginning and end
    const cleanedBlogContent = blogContent
      .replace(/^```json\s*/, "") // remove starting ```json
      .replace(/```$/, "") // remove endding ```
      .trim(); //remove extra spaces

    //now safe to parse
    const data = JSON.parse(cleanedBlogContent);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate blog post ideas",
      error: error.message,
    });
  }
};

//@desc Generate comment reply
//@route POST /api/ai/generate-reply
//@access Private
const generateCommentReply = async (req, res) => {
  try {
    const { author, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Please provide content" });
    }

    const prompt = generateReplyPrompt({ author, content });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    let replyContent = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyContent) {
      return res.status(500).json({
        message: "Failed to parse comment reply from model response",
        error: response,
      });
    }

    // ✅ Clean text
    replyContent = replyContent
      .replace(/^```(json)?/i, "") // Hapus ``` atau ```json di awal
      .replace(/```$/, "") // Hapus ``` di akhir
      .replace(/\\n/g, "\n") // Ganti \n jadi newline asli jika perlu
      .trim();

    res.status(200).json({ content: replyContent });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate comment reply",
      error: error.message,
    });
  }
};

//@desc generate blog post summary
//@route POST /api/ai/generate-summary
//@access Private
const generatePostSummary = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: "Please provide blog content" });
    }

    const prompt = blogSummaryPrompt(content);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    let rawOutput = response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawOutput) {
      return res.status(500).json({
        message: "Model response was empty or could not be parsed",
        error: response,
      });
    }

    // ✅ Clean text sebelum parse JSON
    rawOutput = rawOutput
      .replace(/^```json\s*/, "") // hilangkan ```json di awal
      .replace(/```$/, "") // hilangkan ``` di akhir
      .trim();

    let parsedResult;
    try {
      parsedResult = JSON.parse(rawOutput);
    } catch (err) {
      return res.status(500).json({
        message: "Failed to parse JSON from AI response",
        error: err.message,
        raw: rawOutput, // log mentahan untuk debugging
      });
    }

    res.status(200).json(parsedResult);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate blog post summary",
      error: error.message,
    });
  }
};

module.exports = {
  generateBlogPost,
  generateBlogPostIdeas,
  generateCommentReply,
  generatePostSummary,
};
