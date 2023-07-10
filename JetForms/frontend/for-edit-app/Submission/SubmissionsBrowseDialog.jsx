import {__, http, env, LoadingSpinner, Icon} from '@sivujetti-commons-for-edit-app';

class SubmissionsBrowseDialog extends preact.Component {
    /**
     * @access protected
     */
    componentWillMount() {
        this.setState({submissions: null});
        http.get('/plugins/jet-forms/submissions')
            .then(submissions => {
                this.setState({submissions});
            })
            .catch(err => {
                env.window.console.error(err);
                this.setState({submissions: []});
            });
    }
    /**
     * @param {{floatingDialog: FloatingDialog;}} props
     * @access protected
     */
    render(_, {submissions}) {
        return [
            submissions
                ? submissions.length
                    ? [
                        <div class="table">
                            <div class="tr columns mx-0">
                                <b class="th col-2">{ __('Sent from') }</b>
                                <b class="th col-4">{ __('Sent at') }</b>
                                <b class="th col-6">{ __('Answers') }</b>
                            </div>
                        </div>,
                        <div class="table table-striped">{ submissions.map(({data}) => {
                            const from = data.sentFromPage + (data.sentFromTree.id === 'main' ? '' : ` (${data.sentFromTree.name})`);
                            return <div class="tr columns mx-0">
                                <div class="td col-2" title={ from }><span class="text-ellipsis">{ from }</span></div>
                                <div class="td col-4"><span class="text-ellipsis">{ timeToLocaleFormat(data.sentAt) }</span></div>
                                <div class="td col-6"><span class="text-ellipsis formatted-answers">{ answersToLines(data.answers) }</span></div>
                            </div>;
                        }) }</div>
                    ]
                    : <article class="text-center my-2 py-2">
                        <Icon iconId="message-2"/>
                        <h5>{ __('No one filled out the form yet') }</h5>
                        <div>{ __('Once submitted, the data from your form will be shown here') }.</div>
                    </article>
                : submissions === null
                    ? <LoadingSpinner className="mb-2"/>
                    : null,
            <div>
                <button
                    onClick={ () => this.props.floatingDialog.close() }
                    class="btn mt-2"
                    type="button">Ok</button>
            </div>
        ];
    }
}

/**
 * @param {Array<Answer>} answers
 * @returns {String}
 */
function answersToLines(answers) {
    return answers.slice(0, 3).map(ans => {
        const line = `${ans.label}: ${answerToString(ans.answer)}`;
        return line.length <= 86 ? line : `${line.slice(0, 85)}…`;
    }).join('\n');
}

/**
 * @param {Answer} answer
 * @returns {String}
 */
function answerToString(answer) {
    if (typeof answer === 'string')
        return answer;
    return answer.type === 'singleSelect'
        // radio
        ? answer.entries.find(itm => itm.isSelected)?.text || ''
        // select[multiple]
        : answer.entries.filter(itm => itm.isSelected).map(({text}) => text).join(', ')
}

let formatter = null;

/**
 * @param {Number} unixTime
 * @returns {String} Example: '5. heinäkuuta klo 14.19.44'
 */
function timeToLocaleFormat(unixTime) {
    if (!formatter)
        formatter = new Intl.DateTimeFormat('fi', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    return formatter.format(new Date(unixTime * 1000));
}

/**
 * @typedef {String|SelectAnwser} Answer
 *
 * @typedef SelectAnwser
 * @prop {String} type
 * @prop {Array<{isSelected: Boolean; text: String;}>} entries
 */

export default SubmissionsBrowseDialog;
