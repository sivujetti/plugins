import {__, api, floatingDialog, MenuSection, Icon} from '@sivujetti-commons-for-edit-app';
import CaptchaDataEditDialog from './Settings/CaptchaDataEditDialog.jsx';
import MailSendSettingsManageDialog from './Settings/MailSendSettingsManageDialog.jsx';
import SubmissionsBrowseDialog from './Submission/SubmissionsBrowseDialog.jsx';

class EditAppLeftColumnSection extends preact.Component {
    /**
     * @access protected
     */
    render() {
        return <MenuSection
            title="JetForms"
            subtitle={ __('Manage forms') }
            iconId="send"
            colorClass="color-purple">
            <nav>
                { api.user.getRole() <= api.user.ROLE_EDITOR
                    ? [
                        createLink(SubmissionsBrowseDialog, 'Browse submissions', 'browse-submissions', 'message-2'),
                        createLink(CaptchaDataEditDialog, 'Edit captcha settings', 'edit-captcha-settings', <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="icon-tabler size-sm color-purple color-saturated"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style="stroke-width: 2">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                                <path d="M9 12l2 2l4 -4"></path>
                                <path d="M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3"></path>
                        </svg>)
                    ]
                    : null
                }
                { api.user.getRole() <= api.user.ROLE_ADMIN_EDITOR
                    ? createLink(MailSendSettingsManageDialog, 'Send mail settings', 'change-mail-settings', 'settings')
                    : null
                }
            </nav>
        </MenuSection>;
    }
}

/**
 * @param {MailSendSettingsManageDialog|SubmissionsBrowseDialog|CaptchaDataEditDialog} PopupCls
 * @param {string} title
 * @param {string} id
 * @param {string|preact.VNode<any>} icon
 * @returns {preact.VNode<any>}
 */
function createLink(PopupCls, title, id, icon) {
    return <a onClick={ e => openDialog(e, PopupCls, title) } class="with-icon" href={ `#${id}`}>
        { typeof icon === 'string' ? <Icon iconId={ icon } className="size-sm color-purple color-saturated"/> : icon }
        <span class="color-dimmed">{ __(title) }</span>
    </a>;
}

/**
 * @param {Event} e
 * @param {MailSendSettingsManageDialog|SubmissionsBrowseDialog|CaptchaDataEditDialog} Cls
 * @param {string} title
 * @returns {preact.VNode<any>}
 */
function openDialog(e, Cls, title) {
    e.preventDefault();
    floatingDialog.open(Cls, {
        title: __(title),
        height: Cls !== CaptchaDataEditDialog ? 480 : 600,
    }, {
        floatingDialog,
    });
}

/**
 * @param Event} e
 */
function openEditCaptchaSettingsDialog(e) {
    openDialog(e, CaptchaDataEditDialog, 'Edit captcha settings');
}

export default EditAppLeftColumnSection;
export {openEditCaptchaSettingsDialog};
