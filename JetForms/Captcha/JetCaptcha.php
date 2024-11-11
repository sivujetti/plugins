<?php declare(strict_types=1);

namespace SitePlugins\JetForms\Captcha;

use Pike\Auth\Crypto;
use Pike\{Request};
use SitePlugins\JetForms\ContactFormBlockType;

class JetCaptcha extends AbstractCaptchaImpl {
    /**
     * @inheritdoc
     */
    public function enqueueableJsFiles(): array {
        return ["plugin-jet-forms-jet-captcha.js"];
    }
    /**
     * @inheritdoc
     */
    public function validateResponseToken(?string $input, Request $req): array {
        if (!is_string($input) || strlen($input) < 2) {
            return $this->logAndReturnWith("[Debug] `captchaClientResponseToken` not present", false);
        }
        $now = time();
        $decrypted = "";
        $key = ContactFormBlockType::getSecret();
        $decrypted = (new Crypto)->decrypt($input, $key);
        if (!$decrypted || !is_string($decrypted)) {
            return $this->logAndReturnWith("[Debug] Failed to decrypt `captchaClientResponseToken` or it was empty", false);
        }
        $parts = explode("|", $decrypted);
        if (count($parts) !== 2) {
            return $this->logAndReturnWith("[Debug] Decrypted `captchaClientResponseToken` was malformed", false);
        }
        [$genTime, $ipAddr] = $parts;
        if ($req->attr("REMOTE_ADDR") !== $ipAddr) {
            return $this->logAndReturnWith("[Debug] \$req->attr(\"REMOTE_ADDR\") didn't equal to \$ipAddrFromToken", false);
        }
        $asInt = (int) $genTime;
        if (strval($asInt) !== $genTime) {
            return $this->logAndReturnWith("[Debug] Time part of `captchaClientResponseToken` was malformed", false);
        }
        $fillTime = $now - $asInt;
        $arr = $this->settings->findSettings("jet-captcha") ?? [];
        $minimumFormFillTimeSeconds = $arr["minFormFillTime"] ?? 4;
        $oneDay = 60 * 60 * 24;
        if ($fillTime > $oneDay) { // User spent more than a day filling the form (unlikely > reject it)
            return $this->logAndReturnWith("[Debug] User form completion time {$fillTime} was greater than" .
                        " allowed {$oneDay}.", false);
        }
        if ($fillTime <= $minimumFormFillTimeSeconds) {
            return $this->logAndReturnWith("[Debug] User form completion time {$fillTime} was less than" .
                        " required {$minimumFormFillTimeSeconds}.", false);
        }
        return [true, null];
    }
}
