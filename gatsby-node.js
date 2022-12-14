const path = require(`path`)
const axios = require("axios")

const { getPlatformId } = require("./src/components/util/pretty-platform")
const { sortableName } = require("./src/components/util/sortable-name")
const { extensionSlug } = require("./src/components/util/extension-slugger")
const { generateMavenInfo } = require("./src/maven/maven-info")

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const { data } = await axios.get(
    `https://registry.quarkus.io/client/extensions/all`
  )

  // Do a map so we can wait
  const promises = data.extensions.map(async extension => {
    const node = {
      metadata: {},
      ...extension,
      id: createNodeId(extension.name),
      sortableName: sortableName(extension.name),
      slug: extensionSlug(extension.artifact),
      internal: {
        type: "extension",
        contentDigest: createContentDigest(extension),
      },
      platforms: extension.origins?.map(origin => getPlatformId(origin)),
    }
    if (typeof node.metadata.unlisted === "string") {
      if (node.metadata.unlisted.toLowerCase() === "true") {
        node.metadata.unlisted = true
      } else {
        node.metadata.unlisted = false
      }
    }

    if (node.artifact) {
      node.metadata.maven = await generateMavenInfo(node.artifact)
    }

    return actions.createNode(node)
  })
  return Promise.all(promises)
}

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  // Define a template for an extension
  const extensionTemplate = path.resolve(`./src/templates/extension-detail.js`)

  // Get all extensions
  const result = await graphql(
    `
      {
        allExtension(sort: { fields: [name], order: ASC }, limit: 1000) {
          nodes {
            id
            slug
          }
        }
      }
    `
  )

  if (result.errors) {
    reporter.panicOnBuild(
      `There was an error loading extensions`,
      result.errors
    )
    return
  }

  const posts = result.data.allExtension.nodes

  // Create extension pages
  // `context` is available in the template as a prop and as a variable in GraphQL

  if (posts.length > 0) {
    posts.forEach((post, index) => {
      const previousPostId = index === 0 ? null : posts[index - 1].id
      const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id

      createPage({
        path: post.slug,
        component: extensionTemplate,
        context: {
          id: post.id,
          previousPostId,
          nextPostId,
        },
      })
    })
  }
}

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions

  // TODO why doesn't this work, so we have to do it in the create call?
  if (node.internal.type === `Extension`) {
    const value = slugger.slug(node.name, false)

    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  // Explicitly define the siteMetadata {} object
  // This way those will always be defined even if removed from gatsby-config.js

  createTypes(`
  
    type Extension {
      name: String!
      description: String
      slug: String!
      metadata: ExtensionMetadata
      origins: [String]
      }
      
    type ExtensionMetadata {
      categories: [String]
      built_with_quarkus_core: String
      quarkus_core_compatibility: String
      unlisted: Boolean
      maven: MavenInfo
    }
    
    type MavenInfo {
      url: String
      version: String
      timestamp: Int
    }
    
    
    type SiteSiteMetadata {
      author: Author
      siteUrl: String
      social: Social
    }

    type Author {
      name: String
      summary: String
    }

    type Social {
      twitter: String
    }

  `)
}
