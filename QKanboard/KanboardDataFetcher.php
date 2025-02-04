<?php declare(strict_types=1);

namespace SitePlugins\QKanboard;

use anlutro\cURL\{cURL, Request};
use Pike\ArrayUtils;
use Sivujetti\JsonUtils;

/**
 * @phpstan-type Task object // todo
 * @phpstan-type Tag object // todo
 * @phpstan-type KanboardAPITask object // todo
 * @phpstan-type KanboardAPITag object // todo
 * @phpstan-type KanboardAPITags object // todo
 * @phpstan-type KanboardAPITagData object // todo
 */
class KanboardDataFetcher {
    /** @var \anlutro\cURL\cURL $curl */
    private cURL $curl;
    /** @var int $requestId = 0 */
    private static int $requestId = 0;
    /** @var string $API_URL Example "https://domain.com/kanboard/jsonrpc.php" */
    private string $API_URL;
    /** @var string $API_URL Example "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=" (base64_encode('jsonrpc:<API token from kanboard's "Settings > API">')) */
    private string $API_AUTH_TOKEN;
    /**
     * @param \anlutro\cURL\cURL $curl
     */
    public function __construct(cURL $curl) {
        $this->curl = $curl;
        $config = require __DIR__ . "/config.php";
        $this->API_URL = $config["apiUrl"];
        $this->API_AUTH_TOKEN = $config["apiAuthToken"];
    }
    /**
     * @param int $taskId
     * @return list<Tag>
     */
    public function fetchAndCreateTags(int $taskId): array {
        $data = $this->callApi("getTaskTags", (object) ["task_id" => $taskId]);
        return $this->createTagsFrom($data->result);
    }
    /**
     * @param list<KanboardAPITask> $parsedResult
     * @return list<Task>
     */
    public function createTasksFrom(array $parsedResults): array {
        return array_map(self::createTaskFrom(...), $parsedResults);
    }
    /**
     * @param KanboardAPITask $from
     * @return list<Tag>
     */
    public function createTaskFrom(object $from): object {
        return (object) [
            "id" => $from->id,
            "title" => $from->title,
            "createdAt" => $from->date_creation,
            "tags" => $from->tags ?? [],
            "description" => $from->description,
            "status" => $from->is_active ? 1 : 0,
        ];
    }
    /**
     * Makes an API call to the Kanboard JSON-RPC endpoint
     *
     * @param string $method
     * @param object|list<object> $params
     * @return object Response object with result or error
     */
    public function callApi(string $method, object|array $params): object {
        $request = $this->curl
            ->newRequest("post", $this->API_URL, encoding: Request::ENCODING_RAW)
            ->setData(JsonUtils::stringify((object) [
                "jsonrpc" => "2.0",
                "method" => $method,
                "id" => ++self::$requestId,
                "params" => $params
            ]))
            ->setHeader("X-API-Auth", $this->API_AUTH_TOKEN);
        $response = $request->send();
        return JsonUtils::parse($response->body);
    }
    /**
     * @param list<KanboardAPITags> $from
     * @return list<Tag>
     */
    private function createTagsFrom(object $from): array {
        $out = [];
        foreach ($from as $tagId => $text) {
            $out[] = (object) [
                "id" => (int) $tagId,
                "text" => $text,
                "colorId" => $this->fetchAngGetTagData((int) $tagId)->color_id
            ];
        }
        return $out;
    }
    /**
     * @param int $tagId
     * @return KanboardAPITagData|null
     */
    private function fetchAngGetTagData(int $tagId): object|null {
        static $cache = null;
        if ($cache === null) {
            $data = $this->callApi("getAllTags", []);
            $cache = $data->result;
        }
        return ArrayUtils::findByKey($cache, $tagId, "id");
    }
}
