const blogPostIdeasPrompt = (topic) =>
  `Generate a list of 5 blog post ideas related to ${topic}.

For each blog post idea, return:
- a title
- a 2-line description about the post
- 3 relevant tags
-the tone (e.g., technical,casual,beginner-frinedly, etc.)

Return the result as an array of JSON objects in this format:
[
    {
        "title": "",
        "description": "",
        "tags": ["", "", ""],
        "tone": ""
    }
]
important: DO NOT add any extra text outside the JSON format. Only return valid JSON 
    `;

function generateReplyPrompt(comment, tone = "friendly") {
  const authorName = comment.author?.name || "User";
  const content = comment.content;

  return `
    You received a blog comment from ${authorName}:
    "${content}"
    
    Write a ${tone}, concise, and relevant reply.
    - Acknowledge their comment naturally.
    - Keep the tone consistent with a blog author engaging readers.
    `;
}

const blogSummaryPrompt = (blogContent) => `
You are an AI assistant that summarizes blog posts.

Instructions:
- Read the blog post content below
- Generate a short, catchy, SEO-friendly title (max 12 words).
- Write a clear, engaging summary of about 300 words.
- At the end of the summary, add a markdown section titled **## What You'll Learn**
- Under that heading, list 3–5 key takeaways or skills the reader will learn in **bullet points** using markdown (\`-\`)

Return the result in **valid JSON** with the following structure:
{
  "title": "Short SEO-friendly title",
  "summary": "300-word summary with a markdown section for what you'll learn"
}

Only return valid JSON. Do not include markdown or code blocks around the JSON.

Blog post content:
${blogContent}
`;

module.exports = {
  blogPostIdeasPrompt,
  generateReplyPrompt,
  blogSummaryPrompt,
};
