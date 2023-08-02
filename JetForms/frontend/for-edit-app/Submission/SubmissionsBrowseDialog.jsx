import {__, http, env, LoadingSpinner, Icon} from '@sivujetti-commons-for-edit-app';

class SubmissionsBrowseDialog extends preact.Component {
    // leftAnimEl;
    /**
     * @access protected
     */
    componentWillMount() {
        this.leftAnimEl = preact.createRef();
        this.setState({submissions: null, animState: createaAnimState()});
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
    render(_, {submissions, animState}) {
        return [
            submissions
                ? submissions.length
                    ? <div class="anim-outer">
                        <div class={ `${animState.leftClass}` } ref={ this.leftAnimEl }>
                            <div class="table">
                                <div class="tr columns mx-0">
                                    <b class="th col-3">{ __('Sent from') }</b>
                                    <b class="th col-3">{ __('Sent at') }</b>
                                    <b class="th col-6">{ __('Answers') }</b>
                                </div>
                            </div>
                            <div class="table table-striped">{ submissions.map(sub => {
                                const from = getDetailedSentFrom(sub);
                                const lines = answersToLines(sub.answers);
                                const link = sub.answers.length > 3 || lines.length === 86
                                    ? <a class="text-tinyish" href="#" onClick={ e => (e.preventDefault(), this.showMore(sub)) }>{ __('Show more') }</a>
                                    : null;
                                return <div class="tr columns mx-0">
                                    <div class="td col-3" title={ from }><span class="text-ellipsis">{ from }</span></div>
                                    <div class="td col-3"><span>{ timeToLocalFormat(sub.sentAt) }</span></div>
                                    <div class="td col-6"><span class="text-ellipsis formatted-answers">{ lines }{ link }</span></div>
                                </div>;
                            }) }</div>
                        </div>
                        <div class={ `${animState.rightClass}` } style={ `top: -${(animState.leftClass === ''
                            ? 0
                            : (this.leftAnimEl.current.getBoundingClientRect().height )
                        )}px` }>
                            { animState.submission ? <div>
                                <div class="mb-2"><button onClick={ () => this.setState({animState: createaAnimState(null, 'rtl')}) } class="btn btn-sm" type="button"> &lt; </button></div>

                                <b>{ __('Sent from') }:</b>
                                <div class="mb-2 pb-1">{ getDetailedSentFrom(animState.submission) }</div>

                                <b>{ __('Sent at') }:</b>
                                <div class="mb-2 pb-1">{ timeToLocalFormat(animState.submission.sentAt) }</div>

                                <b>{ __('Answers') }:</b>{ animState.submission.answers.map(ans =>
                                    <div class="mb-1">
                                        <div class="color-dimmed">{ ans.label }:</div>
                                        { answerToString(ans.answer) }
                                    </div>
                                ) }
                            </div> : null }
                        </div>
                    </div>
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
    /**
     * @param {Submission} submission
     * @access private
     */
    showMore(submission) {
        this.setState({animState: createaAnimState(submission, 'ltr')});
        env.document.querySelector('.jsPanel-content').scrollTo({top: 0});
    }
}

/**
 * @param {Submission} submission = null
 * @param {'rtl'|'ltr'} transition = null
 * @returns {{submission: Submission|null; leftClass: String; rightClass: String;}}
 */
function createaAnimState(submission = null, transition = null) {
    const pool = {
        rtl: {leftClass: 'reveal-from-left', rightClass: 'fade-to-right'},
        ltr: {leftClass: 'fade-to-left', rightClass: 'reveal-from-right'},
    };
    const {leftClass, rightClass} = pool[transition] || {leftClass: '', rightClass: ''};
    return {submission, leftClass, rightClass};
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
        : answer.entries.filter(itm => itm.isSelected).map(({text}) => text).join(', ');
}

/**
 * @param {Submission} submission
 * @return {String} Example: '/slug (Maybe some block)'
 */
function getDetailedSentFrom({sentFromPage, sentFromTree}) {
    return sentFromPage + (sentFromTree.id === 'main' ? '' : ` (${sentFromTree.name})`);
}

let formatter = null;

/**
 * @param {Number} unixTime
 * @returns {String} Example: '5. heinäkuuta klo 14.19.44'
 */
function timeToLocalFormat(unixTime) {
    if (!formatter)
        formatter = new Intl.DateTimeFormat(env.document.documentElement.lang || 'fi', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    return formatter.format(new Date(unixTime * 1000));
}

/**
 * @typedef Submission
 * @prop {String} sentFromPage
 * @prop {String} sentFromBlock
 * @prop {Number} sentAt Unix time
 * @prop {{id: String; name: String;}} sentFromTree
 * @prop {{label: String; answer: Answer;}} answers
 *
 * @typedef {String|SelectAnwser} Answer
 *
 * @typedef SelectAnwser
 * @prop {String} type
 * @prop {Array<{isSelected: Boolean; text: String;}>} entries
 */

export default SubmissionsBrowseDialog;
