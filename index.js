const core = require('@actions/core')
const github = require('@actions/github')
const { createActionAuth } = require('@octokit/auth-action');
const fs = require('fs')

async function run() {
  try {
    const auth = createActionAuth()
    const authentication = await auth()
    console.log(authentication)

    const enterprise = core.getInput('enterprise')
    const outputFilename = core.getInput('outputFilename')
    const token = core.getInput('token')
    console.log(token)
    const octokit = github.getOctokit(token)

    console.log(`Retrieving repositories for ${enterprise}!`)
    
    const query = `query($enterpriseName:String!, $cursor:String) {
      enterprise(slug: $enterpriseName) {
        name
        organizations(first: 10, after: $cursor) {
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
          nodes {
            name 
            login
          }
        }
      }
    }`;
    const variables = {
      enterpriseName: enterprise
    }
    
    let hasNextPage = true
    let orgs = []

    while (hasNextPage) {
      const result = await octokit.graphql(query, variables)
      orgs = orgs.concat(result.enterprise.organizations.nodes)
      hasNextPage = result.enterprise.organizations.pageInfo.hasNextPage
      variables.cursor = result.enterprise.organizations.pageInfo.endCursor
    }

    core.setOutput('repo-list', orgs)
    if(outputFilename) {
      fs.writeFileSync(outputFilename, JSON.stringify(orgs))
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()