<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Captcha;

use anlutro\cURL\cURL;
use Pike\Request;
use Sivujetti\JsonUtils;

class ReCaptcha extends AbstractCaptchaImpl {
    /**
     * @inheritdoc
     */
    public function enqueueableJsFiles(): array {
        return ["plugin-jet-forms-grecaptcha.js?site-key={$this->getSiteKey()}"];
    }
    /**
     * @inheritdoc
     */
    public function validateResponseToken(?string $input, Request $req): array {
        if (!is_string($input) || strlen($input) < 2) {
            return $this->logAndReturnWith("[Debug] `captchaClientResponseToken` not present", false);
        }
        $arr = $this->settings->findSettings("grecaptcha") ?? [];
        $curl = new cURL;
        $resp = $curl->post("https://www.google.com/recaptcha/api/siteverify", [
            "secret" => $arr["secretKey"] ?? "-", // Required. The shared key between your site and reCAPTCHA.
            "response" => $input, // Required. The user response token provided by the reCAPTCHA client-side integration on your site.
        ]);
        if ($resp->statusCode !== 200) {
            return $this->logAndReturnWith("[Debug] Expected \"https://www.google.com/recaptcha/api/siteverify\" to" .
                " return with HTTP 200, got HTTP `{$resp->statusCode}` instead",
                true // Note: interpret as valid, because the issue was on Google's end
            );
        }
        if (!($parsed = JsonUtils::parse($resp->getBody(), flags: 0, asObject: false))) {
            return $this->logAndReturnWith("[Debug] \"https://www.google.com/recaptcha/api/siteverify\"" .
                " returned something weird (not json)",
                true // Note: same as above
            );
        }
        $errors = $parsed["error-codes"] ?? null;
        if ($errors) {
            // "timeout-or-duplicate" The response is no longer valid: either is too old or has been used previously.
            if (in_array("timeout-or-duplicate", $errors, true)) {
                return $this->logAndReturnWith("[Debug] \"https://www.google.com/recaptcha/api/siteverify\" returned" .
                    " {\"errors\": \"timeout-or-duplicate\"}", false);
            }
            // Got some of these:
            // "missing-input-secret"    The secret parameter is missing.
            // "invalid-input-secret"    The secret parameter is invalid or malformed.
            // "missing-input-response"  The response parameter is missing.
            // "invalid-input-response"  The response parameter is invalid or malformed.
            // "bad-request"             The request is invalid or malformed.
            return $this->logAndReturnWith("[Debug] \"https://www.google.com/recaptcha/api/siteverify\" returned `" .
                JsonUtils::stringify(["errors" => $errors]) . "`",
                true // Note: interpret as valid, the issue is in the developer's code
            );
        }
        $score = $parsed["score"] ?? 0;
        $minScore = $arr["minScore"] ?? 0.5;
        if ($score < $minScore) {
            return $this->logAndReturnWith("[Debug] Expected \$reCaptchaScore to be `{$minScore}` or " .
                "greater, was `{$score}`",
                false
            );
        }
        return [true, null];
    }
    /**
     * @return string
     */
    private function getSiteKey(): string {
        $arr = $this->settings->findSettings("grecaptcha") ?? [];
        return $arr["siteKey"] ?? "site-key-not-found";
    }
}
