<?php

class Controller_notes extends Controller
{
    public $hash;
    public $model;

    function preAction(){
        session_start();

        $this->hash = md5(filter_var($_POST['paragraph'], FILTER_SANITIZE_STRING)); // Хеш параграфа
        $this->model = new Model_notes($this->hash);
    }

    function action_postdata()
    {
        $note_text = filter_var($_POST['note'], FILTER_SANITIZE_STRING); // Текст переданной заметки
        $id = filter_var($_POST['id'], FILTER_SANITIZE_STRING);
        $status = filter_var($_POST['status'], FILTER_SANITIZE_STRING);

        $this->model->setData($id, $note_text, $status);

        echo json_encode($this->model->data);
    }

    function action_getdata()
    {
        if (!$data = $this->model->data) $data = array(); // Получаем данные о заметках

        echo json_encode($data);
    }

    function action_updatestatus()
    {
        $id = filter_var($_POST['id'], FILTER_SANITIZE_STRING);
        $status = filter_var($_POST['status'], FILTER_SANITIZE_STRING);

        $this->model->updateStatus($status, $id);

        echo json_encode($this->model->data[$id]);

    }

    function action_addnote()
    {
        $id = md5(session_id() . rand(5, 15) . time()); // пытаемся создать уникальный id для заметки

        $this->model->setData($id, "", 1);

        echo $id;
    }
    function action_deletenote()
    {
        $id = filter_var($_POST['id'], FILTER_SANITIZE_STRING);

        echo $this->model->deleteNote($id);
    }
}