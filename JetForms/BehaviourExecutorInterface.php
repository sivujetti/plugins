<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

/**
 * Validates and runs a JetForms behaviour {type: string, data: object} stored
 * to a Contact|SubscriptionForm blocks' behaviours field.
 *
 * @psalm-type RadioGroupInputDetails = array{radios: array<int, array{text: string, value: string}>}
 * @psalm-type SelectInputDetails = array{options: array<int, array{text: string, value: string}>, multiple: bool}
 * @psalm-type InputMeta = array{type: string, name: string, label: string, placeholder: string, isRequired: bool, details: SelectInputDetails|RadioGroupInputDetails|[]}
 * @psalm-type FormInputAnswer = array{label: string, answer: string|{type: string, entries: array<int, {isSelected: bool, text: string}>}}
 * @psalm-type SubmissionInfo = array{answers: array<int, FormInputAnswer>, inputsMeta: array<int, InputMeta>, sentFromPage: string, sentFromBlock: string}
 */
interface BehaviourExecutorInterface {
    /**
     * @param object $behaviourData Valid data from the database (block.behaviours[*].data)
     * @param object $reqBody Validated data from the form (plugins/JetForms/templates/block-some-form.tmpl.php)
     * @psalm-param SubmissionInfo $submissionInfo
     */
    public function run(object $behaviourData, object $reqBody, array $submissionInfo): void;
}
