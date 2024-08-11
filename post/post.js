import https from 'https';
import child_process from 'child_process';

/**
 * Gets the value of an input.
 * Unless trimWhitespace is set to false in InputOptions, the value is also trimmed.
 * Returns an empty string if the value is not defined.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    return val.trim();
}

var reportStatus = (token, repository, sha, context, state, description, url) => new Promise((resolve, reject) => {
    const status_req = https.request({
        hostname: 'api.github.com',
        port: 443,
        path: `/repos/${repository}/statuses/${sha}`,
        method: 'POST',
        headers: {
            'User-Agent': 'casaroli',
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28'
        },
    }, (res) => {
        let data = Buffer.alloc(0);
        res.on('data', (d) => {
            data = Buffer.concat([data, d]);
        });
        res.on('close', () => {
            console.log('received statusCode:', res.statusCode);
            if (!res.statusCode || Math.floor(res.statusCode / 100) != 2) {
                console.error('error, bad statusCode', res.statusCode, 'expected: 2xx');
                reject();
            }
        });
        res.on('end', () => {
            if (data.length) {
                const str = new TextDecoder().decode(data);
                console.log("received data:", JSON.parse(str));
            }
            resolve(data);
        });
    });
    status_req.on('error', (e) => {
        console.error(e);
        reject();
    });
    status_req.end(JSON.stringify({
        state: state,
        description: description,
        context: context,
        target_url: url || null
    }));
});

var listJobs = (token, repository, run_id) => new Promise((resolve, reject) => {
    const status_req = https.request({
        hostname: 'api.github.com',
        port: 443,
        path: `/repos/${repository}/actions/runs/${run_id}/jobs`,
        method: 'GET',
        headers: {
            'User-Agent': 'casaroli',
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28'
        },
    }, (res) => {
        let data = Buffer.alloc(0);
        res.on('data', (d) => {
            data = Buffer.concat([data, d]);
        });
        res.on('close', () => {
            console.log('received statusCode:', res.statusCode);
            if (!res.statusCode || Math.floor(res.statusCode / 100) != 2) {
                console.error('error, bad statusCode', res.statusCode, 'expected: 2xx');
                reject();
            }
        });
        res.on('end', () => {
            if (data.length) {
                const str = new TextDecoder().decode(data);
                console.log("received data:", JSON.parse(str));
            }
            resolve(data);
        });
    });
    status_req.on('error', (e) => {
        console.error(e);
        reject();
    });
    status_req.end();
});

function getState(name) {
    return process.env[`STATE_${name}`] || '';
}

const phone_home_input = getInput('phone-home-input');
const target_url = getInput('target-url');
const custom_context = getInput('context');
const phone_home_list = phone_home_input.split(';');
if (phone_home_list.length < 4) {
    console.error('bad phone home input:', phone_home_input);
    throw 'bad phone home input';
}
const token = phone_home_list[0];
const repository = phone_home_list[1];
const sha = phone_home_list[2];
const context = phone_home_list.slice(3).join(';');
console.log(`::group::Get current job status`);
const run_id = process.env['GITHUB_RUN_ID'] || '';
console.log('Run ID:', run_id);
console.log('List JObs', listJobs(token, repository, run_id));
console.log("Job ID", getState('job_id'));
console.log(child_process.execSync("env").toString());
console.log("::endgroup::");
console.log(`::group::Report finished status to ${repository}:${sha}`);
console.log('context:', context);
console.log('target_url:', target_url);
await reportStatus(token, repository, sha, custom_context || context, 'success', 'Finished', target_url);
console.log("::endgroup::");
//# sourceMappingURL=post.js.map
