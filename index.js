const fs = require('fs')
const core = require('@actions/core')
const { createActionAuth } = require('@octokit/auth-action');
const { Octokit } = require('@octokit/rest');
const octokit = new Octokit({
  authStrategy: createActionAuth,
})

async function run() {
  try {
    const enterprise = core.getInput('enterprise')
    const outputFilename = core.getInput('outputFilename')

    core.info(`Retrieving repositories for ${enterprise}!`)
    const query = `query($enterpriseName:String!, $cursor:String) {
      enterprise(slug: $enterpriseName) {
        name
        organizations(first: 100, after: $cursor) {
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
    let repoResult = []

    while (hasNextPage) {
      const result = await octokit.graphql(query, variables)
      orgs = orgs.concat(result.enterprise.organizations.nodes)
      hasNextPage = result.enterprise.organizations.pageInfo.hasNextPage
      variables.cursor = result.enterprise.organizations.pageInfo.endCursor
    }

    for (let org of orgs) {
      await octokit.paginate(octokit.repos.listForOrg, {
        org: org.login, 
        type: 'internal'
      }).then(repos => {
        for(let repo of repos) {
          let {name, full_name, description, url, stargazers_count, watchers_count, forks_count, topics} = repo
          repoResult.push({name, full_name, description, url, stargazers_count, watchers_count, forks_count, topics, org})
        }
      }).catch(error => {
        core.error(`${org.login} - ${error}`)
      })
    }

    core.setOutput('repo-list', repoResult)
    if(outputFilename) {
      core.info(`Saving repositories to ${outputFilename}`)
      fs.writeFileSync(outputFilename, JSON.stringify(repoResult))
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()