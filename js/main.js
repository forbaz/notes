var notes;
notes = function () {
    var self = this,
        paragraph,
        interval,
        id,
        inputs,
        postdata;


    this.showPanel = function (text) {
        clearInterval(self.interval);
        $('#panel').show();
        self.inputs = [];
        self.paragraph = text;
        self.getData(text, true);
        self.interval = setInterval(function () {
            self.getData(text, false)
        }, 1000);
    };

    this.getData = function (noteText, first) {
        $.ajax({
            url: '/notes/getdata',
            type: "POST",
            async: false,
            data: {note: noteText, paragraph: self.paragraph},
            success: function (data) {

                if (data != "") data = $.parseJSON(data);
                if (first) $('#list').html("");
                var ainputs = [];
                for (note in data) {
                    if (first) {
                        self.addInput(data[note].text, data[note].status, note);
                    } else {

                        input = document.getElementById(note);

                        if (input) { // Если заметка существует
                            $li = $(input).parent('li');
                            if (data[note].status == 0) { // Проверяем статус заметки, добавляет disabled если нужно
                                if ($.cookie("PHPSESSID") != data[note].key) {
                                    $li.css('background-color', 'grey');
                                    $(input).attr('disabled', 'disabled');
                                }
                            } else { // Убираем disabled если заметка не редакктируется
                                $li.css('background-color', '');
                                $(input).removeAttr('disabled');
                            }
                            if (self.id != $(input).attr('id')) { // проверяем не находится ли данных элемент на редакирловании у текущего пользователя
                                if ($(input).val() != data[note].text) { // Проверяем, менялась ли заметка

                                    $(input).val(data[note].text); // Обновляем значение поля input
                                    $li.find('.text').html(data[note].text); // обновляем текст заметки

                                    $li.css('background-color', 'blue');
                                }
                            }
                        } else { // Если заметка не существовала
                            self.addInput(data[note].text, data[note].status, note);
                        }
                    }
                    ainputs.push(note);
                }
                if (self.inputs.length > 0) {
                    for(var i = 0; i < self.inputs.length; i++) {
                        if ($.inArray(self.inputs[i], ainputs) == -1) self.deleteInput(self.inputs[i]);
                    }
                }
                self.inputs = ainputs;
            }
        })
    };

    this.postStatus = function (id) { // обновление статуса заметки, сообщает серверу что данная заметка редактируется пользователем
        self.id = id;
        self.postdata = setInterval(function(){self.postData($("#"+id).val(), id, 0, false)}, 500);
        $.ajax({
            url: '/notes/updatestatus',
            async: false,
            type: "POST",
            data: {id: id, paragraph: self.paragraph, status: 0}
        })
    }

    this.postData = function (noteText, id, status, selfid) { // обновление значения текста земетки
        if (selfid) {
            clearInterval(self.postdata);
            self.id = "";
        }
        $.ajax({
            async: false,
            url: '/notes/postdata',
            type: "POST",
            data: {note: noteText, paragraph: self.paragraph, id: id, status: status}
        })
    }

    this.addNote = function () { // добавление новой заметки, серверу сообщается о создании заметки, и ей присваивается уникальный id
        $.ajax({
            async: false,
            url: '/notes/addnote',
            type: "POST",
            data: {paragraph: self.paragraph},
            success: function (data) {
                self.addInput("", 1, data);
            }
        })
    }

    this.deleteNote = function(id) { // Удалаение заметки
        $.ajax({
            async: false,
            url: '/notes/deletenote',
            type: "POST",
            data: {paragraph: self.paragraph, id: id},
            success: function (data) {
                if (data == 1) self.deleteInput(id);
            }
        })
    }

    this.deleteInput = function(id) {
        var $li = $('[id="'+ id +'"]').parent('li');
        $li.css('background-color', 'red');
        setTimeout(function(){$li.remove()}, 300);
    }

    this.addInput = function (value, status, id) {
        var disabled = "";
        var color = "";
        if (status == 0) {
            disabled = "disabled='disabled'";
            color = 'grey';
        }
        self.inputs.push(id);
        $('#list').append(
            $('<li data-status="' + status + '"></li>')
                .append(
                    $('<input value="' + value + '" ' + disabled + ' id="' + id + '" />')
                        .bind('focusout', function () {
                            self.postData($(this).val(), $(this).attr('id'), 1, true);
                            $(this).hide().parent('li').find(".text").html($(this).val())
                        })
                        .bind('focusin', function () {
                            self.postStatus($(this).attr('id'));
                        })
                        .hide()
                )
                .append("<span class='text'>" + value + "</span>")
                .append(
                    $('<a href="javascript:" class="close" data-note-id="' + id + '">&times;</a>')
                        .bind('click', function(){
                            self.deleteNote($(this).data('note-id'));
                        })
                )
                .bind('dblclick', function () {
                    if ($(this).data('status') == 1) {
                        $(this).find('.text').html("");
                        $(this).find('input').show().focus();
                    }
                })
                .css('background-color', color)
        );
    }

    return this;
};


var n = new notes();


$(function(){
    $('p').on('click', function(){
        n.showPanel($(this).text());
    })

    $('#new_note').on('click', function(){
        n.addNote();
    });

})