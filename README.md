## yii2-dashwiz

Interactive dashboard widgets for Yii 2. Build sortable, collapsible, fullscreenable panels and persist user-specific layout and widget state. Provided by Marco Curatitoli at HalService. Mantained by Pietro Bardone (p3pp01) at Anteo Impresa Sociale.

### Features
- Sort widgets across columns using jQuery UI Sortable
- Collapse/expand, fullscreen, and delete controls
- Optional widget toggler menu built with Handlebars/Mustache
- Persist per-user layout and widget state to DB via built-in action
- Bootstrap-based UI, tooltips support, and SweetAlert confirmations
- i18n ready with message category `dashwiz*`

### Requirements
- Yii 2.0.6+
- Bootstrap assets (`yii\bootstrap`)
- jQuery UI (provided via asset bundle)
- Handlebars/Mustache (provided via asset bundle)
- Bootstrap SweetAlert (provided via asset bundle)

### Installation
Install via Composer:

```bash
composer require anteo/yii2-dashwiz
```

This package autoloads with PSR-4 (`anteo\\dashwiz\\`) and registers its i18n bootstrap via `anteo\\dashwiz\\Bootstrap`.

Run the migration to create the `dashwiz` table:

```bash
php yii migrate/up --migrationPath=@vendor/anteo/yii2-dashwiz/migrations
```

This creates a composite primary key on `layout` and `user_id`, plus `settings` and `positions` text fields.

### Basic Usage
Render a dashboard grid and widgets. Give each widget a unique `id` so its state can be saved.

```php
use anteo\dashwiz\DashwizGrid;
use anteo\dashwiz\DashwizWidget;

<?php DashwizGrid::begin(); ?>
<div class="row">
  <article class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
    <?php DashwizWidget::begin(['id' => 'widget1', 'title' => 'Title 1']); ?>
      widget content 1
    <?php DashwizWidget::end(); ?>

    <?php DashwizWidget::begin(['id' => 'widget2', 'title' => 'Title 2']); ?>
      widget content 2
    <?php DashwizWidget::end(); ?>
  </article>
  <article class="col-xs-12 col-sm-6 col-md-6 col-lg-6">
    <?php DashwizWidget::begin(['id' => 'widget3', 'title' => 'Title 3']); ?>
      widget content 3
    <?php DashwizWidget::end(); ?>

    <?php DashwizWidget::begin(['id' => 'widget4', 'title' => 'Title 4']); ?>
      widget content 4
    <?php DashwizWidget::end(); ?>
  </article>
  </div>
<?php DashwizGrid::end(); ?>
```

### Persisting Layout and State
Attach the built-in save action to your controller and set `saveUrl` on the grid. The action stores per-user data in `anteo\\dashwiz\\models\\Dashwiz`.

Controller:
```php
use anteo\dashwiz\SaveAction;

public function actions()
{
    return [
        'save' => [
            'class' => SaveAction::class,
        ],
    ];
}
```

View:
```php
echo DashwizGrid::widget([
    'saveUrl' => ['site/save'], // route to the action above
]);
```

The grid triggers `dashwiz:save` with JSON payloads for both widget settings (hidden/collapsed) and grid positions; `SaveAction` persists these. To reset saved settings at runtime, trigger:

```js
$('#widget-grid').trigger('reset.jw');
```

Or call the save action with `reset` set to true; it will clear records and redirect.

### `DashwizGrid` options (selected)
- `useModel` (bool, default true): preload defaults from DB for current `user_id` and `layout`
- `layout` (string): logical layout key; defaults to `Yii::$app->controller->route`
- `clientOptions` (array|false): options passed to JS plugin. Notable keys:
  - `sortable` (bool)
  - `titleContainer` (selector)
  - `collapseIcons`, `fullscreenIcons` (array of two icon classes)
  - `dragHandle` (selector)
  - `controlsClass`, `controlsTag`, `controlContainer`, `controlButtonClass`
  - `togglerContainer` (selector or false)
  - `togglerTemplate` (Handlebars/Mustache template string)
  - `togglerElement` (selector)
  - `togglerHideOnHidden` (bool)
- `clientEvents` (array): map of event name to JS handler string. Supported events include: `dashwiz:save`, `dashwiz:reset`, `dashwiz:fullScreen`, `dashwiz:afterLoad`, `dashwiz:delete`, `dashwiz:change`.
- `saveUrl` (route|false): if set, auto-wires `dashwiz:save` and `dashwiz:reset` to POST to this endpoint
- `tag` (string, default `section`): container tag
- `columnTag` (string, default `article`): column container tag
- `togglerContainer`/`Template`/`Element`/`HideOnHidden`: configure optional widget toggler
- `options` (array): HTML attributes for the container
- `deleteMessage` (string): SweetAlert confirmation text
- `controlsTooltip` (array|false): options passed to `tooltip()` for control buttons

### `DashwizWidget` options (selected)
- `id` (string): required to persist state
- `title`, `subtitle` (string)
- `headerTemplate` (string): template with placeholders `{controls}`, `{title}`, `{subtitle}`
- `options`, `headerOptions`, `bodyOptions`, `footerOptions` (array): HTML attributes
- `renderBody` (bool): whether to render body container
- `content` (string): optional direct body content
- Control toggles: `collapse`, `delete`, `fullscreen` (bool)
- `controls` (string): custom controls HTML
- `controlOptions` (array): attributes for controls wrapper and items
- `clientEvents` (array): bind jQuery events to the widget root

### Frontend behavior (JS plugin defaults)
Key defaults from `assets/dashwiz.widget.js`:
- `grid: 'article'`, `widgets: '.dashwiz'`
- `dragHandle: '.dashwiz-header'`
- Icons: Bootstrap glyphicons (overrideable)
- SweetAlert confirmation on delete
- Events emitted: `dashwiz:save`, `dashwiz:change`, `dashwiz:toggle`, `dashwiz:fullScreen`, `dashwiz:delete`
- Optional toggler menu rendered into `togglerContainer` using `togglerTemplate`

### Assets
The main bundle `anteo\\dashwiz\\DashwizAsset` registers:
- CSS: `dashwiz.widget.css`
- JS: `dashwiz.widget.js`
- Depends on:
  - `yii\bootstrap\BootstrapPluginAsset`
  - `anteo\\dashwiz\\HandlebarsAsset` (Mustache + Handlebars)
  - `anteo\\dashwiz\\BootstrapSweetalertAsset` (SweetAlert + CSS)
  - `anteo\\dashwiz\\SortableAsset` (jQuery UI: data, widget, mouse, sortable)

### Internationalization
The bootstrap component registers translations for category `dashwiz*` using `PhpMessageSource` with basePath `@vendor/anteo/yii2-dashwiz/messages`. English and Italian messages are provided; extend as needed.

### Database Model
`anteo\\dashwiz\\models\\Dashwiz` stores serialized `settings` and `positions` per `layout` and `user_id`. It automatically serializes before save and unserializes after find.

### Security Notes
- `SaveAction` requires an authenticated user; it throws if `Yii::$app->user->isGuest`.
- Validate/authorize `saveUrl` routes according to your app’s policies.

### License
BSD 3-Clause
