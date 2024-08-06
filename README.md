# `phone-home` github action

This action will notify the status on a caller repository.

This action is to be used in conjunction with [casaroli/dispatch-phone-home](https://github.com/casaroli/dispatch-phone-home/).

This is useful when you want to dispatch a workflow in a
different organization, and want the status to be reported back
to be used by the status checks.

The action will report a `pending` status when it is called,
and on post, it will report the status of the job,
`sucess`, `failure` or `error`.

The development and the source files are in [casaroli/repo-dispatch](https://github.com/casaroli/repo-dispatch/).
If you have any problems, please open an issue there.

## Inputs

### `phone-home-input`:

The input data from the `dispatch-phone-home` action with
metadata to report the status to the caller.
This data needs to be received by the dispatched workflow
as an input (usually named `phone-home`) and passed here
for example as `${{ inputs.phone-home }}`

### `target-url`

You can override the target_url of the status.
By default is `${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}`, which is a link to the
current workflow run.

### `context`

You can ovveride the context of the status. This is useful if
you have other jobs in the same workflow and want them to set
the status correctly there. By default is the information
already provided as part of `phone-home-input`.

## Example usage

Example of a dispatched workflow that can report back the job
status to the caller:

```yaml
name: Dispatched example

on:
  workflow_dispatch:
    inputs:
      my-input:
        description: user data to pass
        type: string
        required: false
      phone-home:
        type: string
        required: false
    
jobs:
  dispatched:
    name: Dispatched job
    runs-on: ubuntu-22.04
    steps:
      - uses: casaroli/phone-home@v1
        with:
          phone-home-input: ${{ inputs.phone-home }}

      - name: process something
        run: sleep 30

  another-dispatched:
    name: Another Dispatched job
    runs-on: ubuntu-22.04
    steps:
      - uses: casaroli/phone-home@v1
        with:
          phone-home-input: ${{ inputs.phone-home }}
          context: My other status

      - name: process something
        run: sleep 30

```

See the example for [casaroli/dispatch-phone-home](https://github.com/casaroli/dispatch-phone-home/) for the corresponding caller workflow.
