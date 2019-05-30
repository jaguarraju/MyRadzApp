$(function () {
    $
        .widget(
            "custom.rbstable",
            {
                // default options
                options: {
                    red: 255,
                    green: 0,
                    blue: 0,
                    url: '',
                    ColModel: null,
                    SortBy: null,
                    SortDir: 'asc',
                    height: 300,
                    RowList: [1, 10, 100],

                    // Callbacks
                    change: null,
                    random: null
                },
                intParam: {
                    id: null,
                    PageId: null,
                    RowFromId: null,
                    RowToId: null,
                    TotalCountId: null,
                    RowPerPageId: null,
                    PageNumberId: null
                },

                // The constructor
                _create: function () {
                    var $this = this;
                    $this.element.addClass("table table-hover");
                    $this.intParam.id = $($this.element).prop('id');
                    $this.intParam.PageId = 'Page_' + $this.intParam.id;
                    $this.intParam.RowFromId = 'RowFrom_' + $this.intParam.id;
                    $this.intParam.RowToId = 'RowTo_' + $this.intParam.id;
                    $this.intParam.TotalCountId = 'TotalCount_' + $this.intParam.id;
                    $this.intParam.RowPerPageId = 'RowPerPage_' + $this.intParam.id;
                    $this.intParam.PageNumberId = 'PageNumber_' + $this.intParam.id;
                    $this.options.url = $($this.element).data('url');
                    $this.options.SortBy = $($this.element).data('sortby');
                    $this.options.SortDir = $($this.element).data('sortdir');

                    ColumnList = $($this.element.find('thead')[0]).find('th');
                    $($($this.element.find('thead')[0]).find('tr')[0]).css({
                        'height': '50px'
                    });
                    var ColModel = new Array();
                    $(ColumnList).each(function (Index, Value) {
                        var Content = $(Value).text();
                        if (Content != null) {
                            $(Value).data('label', Content);
                        }
                        var ColProps = $(Value).data();
                        Content = ColProps.label;
                        Content = Content != null ? Content : '';
                        ColModel.push(ColProps);
                        $(Value).html('');

                        var IsSort = ColProps.issort;
                        if (IsSort != null && IsSort) {
                            var iTag = $('<i data-sortcol="'
                                + ColProps.colname
                                + '" class="fa fa-arrow-circle-up"></i>');
                            if (ColProps.colname != $this.options.SortBy) {
                                iTag.hide();
                            }
                            var iDiv = $('<div style="overflow: hidden; float:right;"></div>').append(iTag);
                            $(Value).css({
                                'position': 'relative',
                                'overflow': 'hidden',
                                'width': (ColProps.width == null ? '200' : ColProps.width) + 'px'
                            }).append('<div style="float: left">'
                                + Content
                                + '</div>')
                                .append(iDiv)
                                .click(function () {
                                    var $$this = this;
                                    $this.options.SortBy = $($($$this).find('i')[0]).data('sortcol');
                                    $($this.element).find('i').each(function (IIndex, IValue) {
                                        if ($(IValue).data('sortcol') != $this.options.SortBy) {
                                            $(IValue).hide();
                                        }
                                        else {
                                            $(IValue).show();
                                        }
                                    });
                                    var SortOrder = ColProps.sortorder;
                                    var SorColItem = $(this).find('i')[0];
                                    $(SorColItem).removeClass();
                                    if (SortOrder == null || SortOrder == 'asc') {
                                        $this.options.SortDir = 'desc';
                                        $(SorColItem).addClass('fa fa-arrow-circle-down');
                                    } else {
                                        $this.options.SortDir = 'asc';
                                        $(SorColItem).addClass('fa fa-arrow-circle-up');
                                    }
                                    $(this).data('sortorder', $this.options.SortDir);
                                    $this._refresh();
                                });
                        } else {
                            $(Value).append('<label>' + Content + '</label>');
                        }
                    });
                    this.options.ColModel = ColModel;
                    $(this.element).append('<tbody>');

                    var PageNationTable = $('<table id="' + this.intParam.PageId + '" class="table">');
                    var PageNationRow = $('<tr>');
                    var FBackward = $('<button><i class="fa fa-fast-backward"></i></button>').click(function () {
                        $('#' + $this.intParam.PageNumberId).val(1);
                        $this._refresh();
                    });
                    var Backward = $('<button><i class="fa fa-step-backward"></i></button>').click(function () {
                        $('#' + $this.intParam.PageNumberId).val(parseInt($('#' + $this.intParam.PageNumberId).val(), 10) - 1);
                        $this._refresh();
                    });;
                    var PageNumber = $('<input id="' + $this.intParam.PageNumberId + '" type="number"></input>')
                        .css({
                            'width': '100px',
                            'text-align': 'center'
                        }).on('keypress', function (e) {
                            if (e.keyCode == 13) {
                                $this._trigger("change");
                            }
                        });
                    var Forward = $('<button><i class="fa fa-step-forward"></i></button>').click(function () {
                        $('#' + $this.intParam.PageNumberId).val(parseInt($('#' + $this.intParam.PageNumberId).val(), 10) + 1);
                        $this._refresh();
                    });;
                    var FForward = $('<button><i class="fa fa-fast-forward"></i></button>').click(function () {
                        $('#' + $this.intParam.PageNumberId).val(1);
                        $this._refresh();
                    });;

                    $('<td>').css({
                        'width': '33%'
                    }).append(FBackward).append(Backward).append(PageNumber).append(Forward)
                        .append(FForward).appendTo(PageNationRow);
                    var PageSelectOpt = $('<select id="' + this.intParam.RowPerPageId + '">').change(function (e) {
                        $this._refresh();
                    });
                    $(this.options.RowList).each(function (Index, Value) {
                        PageSelectOpt.append('<option value="' + Value + '">' + Value + '</option>');
                    });
                    $('<td>').css({
                        'width': '33%',
                        'text-align': 'center'
                    }).append(PageSelectOpt).appendTo(PageNationRow);

                    PageNationRow.append('<td style="width:33%; text-align:right">Records from <label id="'
                        + this.intParam.RowFromId
                        + '">0</label> to <label id="'
                        + this.intParam.RowToId
                        + '">0</label> of <label id="'
                        + this.intParam.TotalCountId
                        + '">0</label></td>');

                    PageNationTable.append(PageNationRow);

                    $(PageNationTable).insertAfter(this.element);
                    $this._refresh();
                },

                // Called when created, and later when changing options
                _refresh: function () {
                    var $this = this;
                    var $tbody = $($this.element.find('tbody')[0]);
                    $tbody.html('');
                    var ColModel = $this.options.ColModel;
                    var RowPerPage = parseInt($('#' + $this.intParam.RowPerPageId).val(), 10);
                    var PageNumber = $('#' + $this.intParam.PageNumberId).val();
                    $.ajax({
                        url: this.options.url,
                        data: {
                            RowPerPage: RowPerPage,
                            PageNumber: (PageNumber == null || PageNumber == '') ? 1 : PageNumber,
                            SortBy: $this.options.SortBy,
                            SortDir: $this.options.SortDir
                        },
                        dataType: 'JSON',
                        type: 'GET',
                        success: function (Response) {
                            $(Response.ViewModelList).each(function (Index, Value) {
                                var NewRow = $('<tr>').css({
                                    'height': '45px'
                                });
                                var DataValue = Value;
                                $(ColModel).each(function (MIndex, MValue) {
                                    NewRow.append('<td>' + DataValue[MValue.colname] + '</td>');
                                });
                                $tbody.append(NewRow);
                            });
                            $('#' + $this.intParam.PageNumberId).val(Response.GridDetail.PageNumber);
                            var RecordFrom = ((Response.GridDetail.PageNumber - 1) * RowPerPage) + 1;
                            var RecordTo = ((Response.GridDetail.PageNumber - 1) * RowPerPage) + 1;
                            $('#' + $this.intParam.RowFromId).text(RecordFrom);
                            $('#' + $this.intParam.RowToId).text(RowPerPage + RecordFrom - 1);
                            $('#' + $this.intParam.TotalCountId).text(Response.GridDetail.TotalCount);

                        }
                    });
                    // Trigger a callback/event
                    this._trigger("change");
                },

                // A public method to change the color to a random value
                // can be called directly via .colorize( "random" )
                random: function (event) {

                },

                // Events bound via _on are removed automatically
                // revert other modifications here
                _destroy: function () {
                    // remove generated elements
                    // this.changer.remove();

                    this.element.removeClass("table table-hover");
                },

                // _setOptions is called with a hash of all options that
                // are changing
                // always refresh when changing options
                _setOptions: function () {
                    // _super and _superApply handle keeping the right
                    // this-context
                    this._superApply(arguments);
                    this._refresh();
                },

                // _setOption is called for each individual option that
                // is changing
                _setOption: function (key, value) {
                    // prevent invalid color values
                    this._super(key, value);
                }
            });

    // Initialize with default options
    $("table.rbstable").rbstable();

});