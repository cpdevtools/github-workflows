import { Octokit } from '@octokit/rest';
import { SemVer } from 'semver';
import simpleGit from 'simple-git';
import { applyVersion } from './apply-version';


const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

export async function createVersionBranch(version: string = 'main') {
    if (version !== 'main') {
        const git = simpleGit();
        const currentBranch = await git.branch();
        const currentBranchName = currentBranch.current;
        const versionBranchName = `release/${version}`;

        const status = await git.status();
        if (status.files.length > 0) {
            console.info('There are uncommitted changes. Please commit them before creating a new version.');
            return;
        }

        await git.fetch(['--all', '--prune']);

        const branchExists = await git.branch(['-a']).then((branches) => {
            return branches.all.includes(`remotes/origin/${versionBranchName}`);
        });

        if (branchExists) {
            console.info(`Branch ${versionBranchName} already exists.`);
            return;
        }

        try {
            await git.checkoutBranch(versionBranchName, currentBranchName);
            applyVersion(version);

            await git.add('.');
            await git.commit(`Apply version ${version}`);
            await git.push('origin', versionBranchName);
        }catch(e){
            console.error(e);
        }
    }
}

async function upsertTag(tagName: string, sha: string) {
    try {
        await octokit.git.createRef({
            owner: 'cpdevtools',
            repo: 'common-github-workflows',
            ref: `refs/tags/${tagName}`,
            sha
        });
    } catch (e) {
        await octokit.git.updateRef({
            owner: 'cpdevtools',
            repo: 'common-github-workflows',
            ref: `tags/${tagName}`,
            sha
        });
    }
}