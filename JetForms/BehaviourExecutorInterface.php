<?php declare(strict_types=1);

namespace SitePlugins\JetForms;

use Pike\{Response};

/**
 * Validates and runs a JetForms behaviour {type: string, data: object} stored
 * to a Contact|SubscriptionForm blocks' behaviours field.
 *
 * @phpstan-type RadioGroupInputDetails array{radios: list<object{text: string, value: string}>}
 * @phpstan-type SelectInputDetails array{options: list<object{text: string, value: string}>, multiple: bool}
 * @phpstan-type InputMeta array{type: string, name: string, label: string, placeholder: string, isRequired: bool, details: SelectInputDetails|RadioGroupInputDetails|[]}
 * @phpstan-type FormInputAnswer array{label: string, answer: string|{type: string, entries: list<{isSelected: bool, text: string}>}}
 * @phpstan-type SubmissionInfo array{answers: list<FormInputAnswer>, inputsMeta: list<InputMeta>, sentFromPage: string, sentFromBlock: string, sentFromTree: object{id: string, name: string}}
 */
interface BehaviourExecutorInterface {
    /**
     * @param object $behaviourData Valid data from the database (block.behaviours[*].data)
     * @param object $reqBody Validated data from the form (plugins/JetForms/templates/block-some-form.tmpl.php)
     * @param \Pike\Response $res
     * @param SubmissionInfo $submissionInfo
     * @param list<array{result: mixed|\Exception, executor: class-string, isError: bool}> $runResultsArr Values returned from the previous behaviours' run()s
     * @return mixed The results of this run()
     */
    public function run(object $behaviourData, object $reqBody, Response $res, array $submissionInfo, array $runResultsArr): mixed;
}
