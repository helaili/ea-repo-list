# ea-repo-list action

This action retrieves all `internal` repositories from your GitHub Enterprise Account. 

## Inputs

### `enterprise`

**Required** The name of the Enterprise Account.

### `token`

**Required** A [GitHub Personal Access Token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) allowing to browse the Enterprise Account thanks to the `read:org` and `read:enterprise` permissions. Note that this token must be allowed with all SAML enabled organizations. 

<img width="797" alt="Screen Shot 2021-01-25 at 22 01 39" src="https://user-images.githubusercontent.com/2787414/105766100-9c10b200-5f59-11eb-9e16-55641a8aa8ae.png">

### `outputFilename`

The file to write the list of repositories to. 

## Outputs

### `repo-list`

An array containing the list of `internal` repositories for each organization of the Enterprise Account.

## Example usage

```yaml
jobs:
  repo-list:
    runs-on: ubuntu-latest
 
    steps:
    - uses: actions/checkout@v2
    - name: Get the repos
      uses: helaili/ea-repo-list@master
      with:
        enterprise: octodemo
        outputFilename: repos.json
        token: ${{secrets.GH_EA_TOKEN}}
    - name: Save the repos
      run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add .
          git commit --allow-empty -m "latest list of repositories"
          git push
```
