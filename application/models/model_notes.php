<?php
class Model_notes {

    public $filepath = "application/data/";
    public $hash;
    public $data;

    function __construct($hash) {
        $this->hash = $hash;

        $this->data = $this->getData($hash);
    }

    public function getData() {
        $filename = $this->getFilename();
        if (file_exists($filename)) {
            return json_decode(file_get_contents($filename), true);
        } else return false;
    }

    public function setData($id, $text, $status) {
        if ($this->checkSesseonId($id)) {
            $this->data[$id]['text'] = $text;
            $this->data[$id]['status'] = $status;
            if ($status == 1) $this->data[$id]['key'] = "";

            file_put_contents($this->getFilename(), json_encode($this->data));
        }
    }

    public function updateStatus($status, $id) {
        if ($status == 1) { // Если статус "доступен" (1)
            if ($this->checkSesseonId($id)) {
                $this->data[$id]['status'] = $status;
            }
        } else {
            $this->data[$id]['status'] = $status;
            $this->data[$id]['key'] = session_id();
        }
        file_put_contents($this->getFilename(), json_encode($this->data));
    }

    public function deleteNote($id) {
        //$this->data[$id]['text'] = "";

        if ($this->checkSesseonId($id)) {
            unset($this->data[$id]);

            file_put_contents($this->getFilename(), json_encode($this->data));
            return 1;
        }
        return 0;
    }

    private function checkSesseonId($id) {
        if (!empty($this->data[$id]['key'])) {
            if ($this->data[$id]['key'] != session_id()) return false;
        };
        return true;
    }

    private function getFilename() {
        return $this->filepath . "$this->hash.json";
    }
}