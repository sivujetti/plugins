import {__, api, floatingDialog, MenuSection, Icon} from '@sivujetti-commons-for-edit-app';
import MailSendSettingsManageDialog from './MailSendSettings/MailSendSettingsManageDialog.jsx';
import SubmissionsBrowseDialog from './Submission/SubmissionsBrowseDialog.jsx';

class EditAppLeftColumnSection extends MenuSection {
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
                    ? <a onClick={ e => this.openDialog(e, SubmissionsBrowseDialog, 'Browse submissions') } class="with-icon" href="#browse-submissions">
                        <Icon iconId="message-2" className="size-xs color-purple color-saturated"/>
                        <span class="color-dimmed">{ __('Browse submissions') }</span>
                    </a>
                    : null
                }
                { api.user.getRole() <= api.user.ROLE_ADMIN_EDITOR
                    ? <a onClick={ e => this.openDialog(e, MailSendSettingsManageDialog, 'Send mail settings') } class="with-icon" href="#change-mail-settings">
                        <Icon iconId="settings" className="size-xs color-purple color-saturated"/>
                        <span class="color-dimmed">{ __('Send mail settings') }</span>
                    </a>
                    : null
                }
            </nav>
        </MenuSection>;
    }
    /**
     * @param {Event} e
     * @param {MailSendSettingsManageDialog|SubmissionsBrowseDialog} Cls
     * @param {String} title
     * @access private
     */
    openDialog(e, Cls, title) {
        e.preventDefault();
        floatingDialog.open(Cls, {
            title: __(title),
        }, {
            floatingDialog,
        });
    }
}

export default EditAppLeftColumnSection;
