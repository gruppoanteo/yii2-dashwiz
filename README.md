Dashwiz Extension
======================
Dashboard Extension - Provided by Marco Curatitoli at HalService

Installation
------------

The preferred way to install this extension is through [composer](http://getcomposer.org/download/).

Either run

```
php composer.phar require --prefer-dist hal/yii2-dashwiz "*"
```

or add

```
"hal/yii2-dashwiz": "*"
```

to the require section of your `composer.json` file.


Usage
-----

Once the extension is installed:

```php
./yii migrate --migrationPath=@vendor/hal/yii2-dashwiz/migrations
```

Look to DashwizGrid.php for sample code.

Example for dashboard view:

```php
use hal\dashwiz\DashwizGrid;
use hal\dashwiz\DashwizWidget;

<h1>DASHBOARD</h1>

<?php DashwizGrid::begin([
    'id' => 'dashboard',
    'saveUrl' => ['/core/default/save'],
    'togglerContainer' => '#test',
]); ?>

<div id="test"></div>

<div class="row">
    <article class="col-xs-12 col-sm-6 col-md-4 col-lg-6">
        <?php DashwizWidget::begin(['id' => 'widget1', 'title' => 'Title 1', 'options' => ['class' => 'panel-success']]) ?>
        widget content 1
        <?php DashwizWidget::end() ?>
        <?php DashwizWidget::begin(['id' => 'widget2', 'title' => 'Title 2', 'options' => ['class' => 'panel-primary']]) ?>
        widget content 2
        <?php DashwizWidget::end() ?>
    </article>
    <article class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
        <?php DashwizWidget::begin(['id' => 'widget3', 'title' => 'Title 3', 'options' => ['class' => 'panel-warning']]) ?>
        widget content 3
        <?php DashwizWidget::end() ?>

        <?php DashwizWidget::begin(['id' => 'widget4', 'title' => 'Title 4', 'options' => ['class' => 'panel-danger']]) ?>
        widget content 4
        <?php DashwizWidget::end() ?>
    </article>
    <article class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
        <?php DashwizWidget::begin(['id' => 'widget5', 'title' => 'Title 5', 'options' => ['class' => 'panel-default']]) ?>
        widget content 5
        <?php DashwizWidget::end() ?>
        
        <?php DashwizWidget::begin(['id' => 'widget6', 'title' => 'Title 6', 'options' => ['class' => 'panel-info']]) ?>
        widget content 6
        <?php DashwizWidget::end() ?>
    </article>
</div>
<?php DashwizGrid::end(); ?>

```
You can use your own widgets, you only need to add the following classes:
dashwiz-widget -> your widget main container
dashwiz-header -> your widget header container
dashwiz-title -> your widget title
dashwiz-body -> your widget body container

To have collapse, fullscreen and remove button add attributes
data-dashwiz-action="collapse"
data-dashwiz-action="fullscreen"
data-dashwiz-action="delete" 

to the buttons you need to perform actions.

Have a look at DashwizGrid::clientOptions (dashwiz.widget.js) in order to config dashboard to fit your widgets.
