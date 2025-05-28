const path = require("path");
const { createFilePath } = require("gatsby-source-filesystem");
const readingTime = require("reading-time");

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === "Mdx") {
    // Create slug from file path
    const slug = createFilePath({ node, getNode, basePath: "content/blog" });
    createNodeField({
      node,
      name: "slug",
      value: slug,
    });

    // Add reading time estimate - use 'body' instead of 'rawBody' for MDX
    if (node.body) {
      const stats = readingTime(node.body);
      createNodeField({
        node,
        name: "readingTime",
        value: stats.text,
      });
    }
  }
};

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  const result = await graphql(`
    {
      allMdx(sort: { frontmatter: { date: DESC } }) {
        nodes {
          id
          fields {
            slug
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild("🚨 ERROR loading createPages GraphQL query");
    return;
  }

  const posts = result.data.allMdx.nodes;

  posts.forEach((post, index) => {
    const previousPostId = index === posts.length - 1 ? null : posts[index + 1].id;
    const nextPostId = index === 0 ? null : posts[index - 1].id;

    if (!post.fields?.slug) {
      reporter.warn(`Skipping post with missing slug: ${post.id}`);
      return;
    }

    createPage({
      path: post.fields.slug,
      component: `${path.resolve("./src/templates/blog-post.js")}?__contentFilePath=${post.internal.contentFilePath}`,
      context: {
        id: post.id,
        previousPostId,
        nextPostId,
      },
    });
  });
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type Frontmatter {
      title: String!
      date: Date! @dateformat
      description: String
      coverImage: File @fileByRelativePath
      coverImageCaption: String
    }

    type Mdx implements Node {
      frontmatter: Frontmatter!
      fields: Fields!
    }

    type Fields {
      slug: String!
      readingTime: String!
    }
  `);
};