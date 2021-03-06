Ext.define('LookbackCumulativeFlowChartApp', {
    extend:'Rally.app.App',
    componentCls:'app',

    layout:'border',
    items:[
        {
            region:'north',
            height:30,
            xtype:'container',
            layout:'hbox',
            itemId:'header'
        },
        {
            region:'center',
            layout:'fit',
            xtype:'container',
            itemId:'chart'
        }
    ],

    launch:function () {
        this.down('#header').add(
                {
                    xtype:'rallydatefield',
                    itemId:'startDate',
                    cls:'date-field',
                    fieldLabel:'Start Date',
                    labelWidth: 60,
                    format:Rally.util.DateTime.getUserExtDateFormat(),
                    value:Rally.util.DateTime.add(new Date, 'day', -30),
                    listeners:{
                        change:this._onDateChange,
                        scope:this
                    }
                },
                {
                    xtype:'rallydatefield',
                    itemId:'endDate',
                    cls:'date-field',
                    fieldLabel:'End Date',
                    labelWidth: 60,
                    format:Rally.util.DateTime.getUserExtDateFormat(),
                    value:new Date(),
                    listeners:{
                        change:this._onDateChange,
                        scope:this
                    }
                },
                {
                    xtype:'rallybutton',
                    text:'Choose Portfolio Item',
                    listeners:{
                        click:this._onButtonClick,
                        scope:this
                    }
                }
        );
    },

    _onButtonClick:function(){
        this.add({
            xtype:'rallychooserdialog',
            artifactTypes:['portfolioitem'],
            storeConfig: {
                fetch: ['PortfolioItemType']
            },
            title:'Choose Portfolio Item',
            autoShow:true,
            listeners:{
                artifactChosen:this._onArtifactChosen,
                scope:this
            }
        });
    },

    _onArtifactChosen:function (results) {
        this._portfolioItem = results.data;
        this._buildChart(this._portfolioItem);
    },

    _onDateChange:function (datefield, newValue, oldValue) {
        if (this._portfolioItem && Ext.isDate(newValue)) {
            this._buildChart(this._portfolioItem);
        }
    },

    _buildChart:function (portfolioItem) {
        if (this.chart) {
            this.chart.destroy();
        }

        var storeConfig = {
            context:{
                workspace:this.getContext().getDataContext().workspace
            },
            filters:[
                {
                    property:'_Type',
                    value:'HierarchicalRequirement'
                },
                {
                    property:'_ItemHierarchy',
                    value:portfolioItem.ObjectID
                },
                {
                    property:'Children',
                    value:null
                }
            ]
        };

        this.chart = this.down('#chart').add({
            xtype:'rallycumulativeflowchart',
            cls:'cumulative-flow-chart',
            storeConfig:storeConfig,
            cumulativeFlowConfig:{
                startDate:this.down('#startDate').getValue(),
                endDate:this.down('#endDate').getValue(),
                timeZone:this.getContext().getUser().UserProfile.TimeZone ||
                    this.getContext().getWorkspace().WorkspaceConfiguration.TimeZone,
                aggregationType:'count'
            },
            chartConfig:{
                title:{
                    text:portfolioItem.PortfolioItemType.Name + ' ' + portfolioItem.FormattedID + ': ' + portfolioItem.Name
                }
            }
        });
    }
});