interface ConfigureBehaviourPanelProps {
    behaviour: Behaviour;
    cssClass: String;
    onConfigurationChanged: (vals: {[propName: String]: any;}) => void;
    endEditMode: () => void;
    panelHeight: Number;
    blockCopy: RawBlock;
}

interface Behaviour {
    name: String; // Example 'SendMail' or 'ShowSentMessage'
    data: {[key: String]: any;};
}

interface BehaviourConfigurerImpl {
    configurerLabel: String; // Example: 'näytä käyttäjälle viesti'
    getButtonLabel: (data: {[key: String]: any;}) => String;
    configurerCls: preact.ComponentConstructor;
    isTerminator?: Boolean;
}

interface ContactFormBlockProps {
    behaviours: String;
    useCaptcha: Number;
}

interface ContactFormBlockPropsIr {
    behaviours: Array<Behaviour>;
    useCaptcha: Number;
}
