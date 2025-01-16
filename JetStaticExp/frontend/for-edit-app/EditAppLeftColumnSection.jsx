import {__, api, floatingDialog, Icon, MenuSection, PathIcon} from '@sivujetti-commons-for-edit-app';
import ExportSiteDialog from './ExportSiteDialog.jsx';

class EditAppLeftColumnSection extends preact.Component {
    /**
     * @access protected
     */
    render() {
        return <MenuSection
            title="JetStaticExp"
            subtitle={ __('Export functionalities') }
            icon={ <PathIcon className="p-absolute size-sm mr-2 color-pink"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M6 20.735a2 2 0 0 1 -1 -1.735v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-1"></path><path d="M11 17a2 2 0 0 1 2 2v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2a2 2 0 0 1 2 -2z"></path><line x1="11" y1="5" x2="10" y2="5"></line><line x1="13" y1="7" x2="12" y2="7"></line><line x1="11" y1="9" x2="10" y2="9"></line><line x1="13" y1="11" x2="12" y2="11"></line><line x1="11" y1="13" x2="10" y2="13"></line><line x1="13" y1="15" x2="12" y2="15"></line></PathIcon> }
            colorClass="color-pink">
            <nav>
                { api.user.getRole() <= api.user.ROLE_EDITOR
                    ? <a onClick={ this.openDialog.bind(this) } class="with-icon" href="#export-site">
                        <Icon iconId="device-floppy" className="size-sm color-pink color-saturated"/>
                        <span class="color-dimmed">{ __('Export site') }</span>
                    </a>
                    : null
                }
            </nav>
        </MenuSection>;
    }
    /**
     * @param {Event} e
     * @access private
     */
    openDialog(e) {
        e.preventDefault();
        floatingDialog.open(ExportSiteDialog, {
            title: __('Export site'),
        }, {
            floatingDialog,
        });
    }
}

export default EditAppLeftColumnSection;
