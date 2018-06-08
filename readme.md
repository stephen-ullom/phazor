# Phazor

A quicker PHP syntax similar to Razor Web Pages.

[NPM Package](https://www.npmjs.com/package/phazor)

[Github Repository](https://github.com/Slulego/Phazor)

## Basic Example

Create a **.ph** file.

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
Install Phazor with NPM ```npm install phazor -g```.

Run the compiler "```phazor source-folder destination-folder```" from the parent directory.

Phazor outputs the following **output/example.php**:

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
