import {__, api, floatingDialog, MenuSection, Icon} from '@sivujetti-commons-for-edit-app';
import ExportSiteDialog from './ExportSiteDialog.jsx';

class EditAppLeftColumnSection extends preact.Component {
    /**
     * @access protected
     */
    render() {
        return <MenuSection
            title="JetStaticExp"
            subtitle={ __('Export functionalities') }
            iconId="box"
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
