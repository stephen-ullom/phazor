# Phazor

A quicker PHP syntax similar to Razor Web Pages.

Install Phazor with NPM ```npm i phazor -g```.

Run the compiler "```phazor sourceFolder destinationFolder```" from the parent directory.

[NPM Package](https://www.npmjs.com/package/phazor)

[Github Repository](https://github.com/Slulego/Phazor)



Add PHP code using the `$` symbol.

## Code Blocks - `${}`

```php
${ $message = "I like fruit."; }
```

Compiles to:
```php
<?php $message = "I like fruit."; ?>
```

## Inline Expressions - `$variable`

```html
<p>$message</p>
```

Compiles to:
```html
<p><?php echo $message; ?></p>
```

For complex expressions use parenthesis - `$()`.

```html
<p>$($cost * 2)</p>
```

Compiles to:
```html
<p><?php echo $cost * 2; ?></p>
```


## Statements - `$function () {}`

```html
$if ($condition == true) {
    <p>$message</p>
}
```

Compiles to:
```html
<?php if ($condition == true) { ?>
    <p>$message</p>
<?php } ?>
```

## Escape Entity - `$$`

```html
<p>That fruit will cost you $$1.99 each.</p>
```

Compiles to:
```html
<p>That fruit will cost you $1.99 each.</p>
```

---

## Basic Example

Install Phazor with NPM `npm i phazor -g`.

Create a folder.

Create a **.ph** file inside the folder.

**example.ph**
```html
<!DOCTYPE html>
<html>
<head>
    ${
        $title = 'Fruit for Sale';
        $fruits = array('strawberries' => 'red',
            'oranges' => 'orange',
            'pineapples' => 'yellow',
            'kiwis' => 'green',
            'blueberries' => 'blue',
            'grapes' => 'purple');
    }
    <title>$title.</title>
    <link rel="stylesheet" type="text/css" href="main.css" />
    <script src="main.js"></script>
</head>
<body>
    <div id="page">
        <h1>$title</h1>
        <ul>
            $foreach ($fruits as $fruit => $color) {
                <li style="color: $color;">
                    $(ucwords($fruit))
                    $if ($color == "green") {
                        <strong>- Meh.</strong>
                    } else if($color == "orange") {
                        <strong>- Yum!</strong>
                    }
                </li>
            }
        </ul>
        <p>All these fruits together will cost $$100.</p>
    </div>
</body>
</html>
```

Run the compiler "```phazor sourceFolder destinationFolder```" from the parent directory.

Phazor outputs the following **.php** file into the destination folder:

```html
<!DOCTYPE html>
<html>
<head>
    <?php 
        $title = 'Fruit for Sale';
        $fruits = array('strawberries' => 'red',
            'oranges' => 'orange',
            'pineapples' => 'yellow',
            'kiwis' => 'green',
            'blueberries' => 'blue',
            'grapes' => 'purple');
    ?>
    <title><?php echo $title; ?>.</title>
    <link rel="stylesheet" type="text/css" href="main.css" />
    <script src="main.js"></script>
</head>
<body>
    <div id="page">
        <h1><?php echo $title; ?></h1>
        <ul>
            <?php foreach ($fruits as $fruit => $color) { ?>
                <li style="color: <?php echo $color; ?>;">
                    <?php echo ucwords($fruit); ?>
                    <?php if ($color == "green") { ?>
                        <strong>- Meh.</strong>
                    <?php } else if($color == "orange") { ?>
                        <strong>- Yum!</strong>
                    <?php } ?>
                </li>
            <?php } ?>
        </ul>
        <p>All these fruits together will cost $100.</p>
    </div>
</body>
</html>
```

Which renders in the browser:

># Fruit for Sale
>- Strawberries
>- Oranges - Yum!
>- Pineapples
>- Kiwis - Meh.
>- Blueberries
>- Grapes
>
>All these fruits together will cost $100.


Todo: Escape brackets within quotes.