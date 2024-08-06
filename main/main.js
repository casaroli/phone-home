import https from 'https';

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

function reportStatus (token, repository, sha, context, state, description, url) {
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
        res.on('data', (d) => {
            const str = new TextDecoder().decode(d);
            console.log("received data:", str);
        });
        res.on('close', () => {
            console.log('received statusCode:', res.statusCode);
            if (!res.statusCode || Math.floor(res.statusCode / 100) != 2) {
                console.error('error, bad statusCode', res.statusCode, 'expected: 2xx');
                throw "bad status code";
            }
        });
    });
    status_req.write(JSON.stringify({
        state: state,
        description: description,
        context: context,
        target_url: url || null
    }));
    status_req.on('error', (e) => {
        console.error(e);
        throw "request error";
    });
    status_req.end();
}

const phone_home_input = getInput('phone-home-input');
const target_url = getInput('target-url');
const phone_home_list = phone_home_input.split(';');
if (phone_home_list.length < 4) {
    console.error('bad phone home input:', phone_home_input);
    throw 'bad phone home input';
}
const token = phone_home_list[0];
const repository = phone_home_list[1];
const sha = phone_home_list[2];
const context = phone_home_list.slice(3).join(';');
reportStatus(token, repository, sha, context, 'pending', 'Started', target_url);
//# sourceMappingURL=main.js.map
