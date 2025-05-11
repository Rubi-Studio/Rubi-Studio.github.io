<?php
// header.php
$current_page = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rubi's TTRPG Hub</title>
    <link rel="stylesheet" href="style/style-ttrpg.css">
</head>
<body>
    <header>
        <div class="cabecera-contenido">
            <div class="logo-nombre">
                <a href="index.php">
                    <img src="imagenes/logo-ttrpg.png" alt="Logo Rubi TTRPG" height="70" width="70">
                </a>
                <h1>Rubi's TTRPG Hub</h1>
            </div>
        </div>
        <nav>
            <a href="wotf.php" <?php if($current_page == 'wotf.php') echo 'class="active"'; ?>>Will of the Forge</a>
            <a href="bbII.php" <?php if($current_page == 'bbII.php') echo 'class="active"'; ?>>Bloodborne II</a>
            <a href="artesius.php" <?php if($current_page == 'artesius.php') echo 'class="active"'; ?>>Artesius</a>
            <a href="magia.php" <?php if($current_page == 'magia.php') echo 'class="active"'; ?>>Sistemas de Magia</a>
            <a href="combate.php" <?php if($current_page == 'combate.php') echo 'class="active"'; ?>>Combate</a>
            <a href="exploracion.php" <?php if($current_page == 'exploracion.php') echo 'class="active"'; ?>>Exploración</a>
        </nav>
    </header>