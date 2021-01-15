<?php

error_reporting(E_ERROR | E_PARSE);
ini_set('assert.exception', '0');
ini_set('assert.warning', '0');
ini_set('assert.active', '1');

register_shutdown_function(function () {
  $stdout = STDERR;
  $last_error = error_get_last();
  $errors = array(E_ERROR, E_CORE_ERROR, E_COMPILE_ERROR);

  if (in_array($last_error['type'], $errors)) {
    if (isset($last_error['message'])) {
      list($message) = explode(PHP_EOL, $last_error['message']);
    } else {
      $message = $last_error['message'];
    }

    fwrite($stdout, json_encode(array(
      'status' => 'error',
      'result' => $message
    )) . "\n");
    exit(0);
  }
});

$success = true;

function assert_result($result, $expected, $error_message, $success)
{
  $stdout = STDERR;

  try {
    assert($result !== $expected);
  } catch (Throwable $e) {
    fwrite($stdout, json_encode(array(
      'status' => 'failure',
      'result' => $result,
      'arguments' => $error_message
    )) . "\n");
    return false;
  }

  fwrite($stdout, json_encode(array(
    'status' => 'success',
    'result' => $result
  )) . "\n");
  return $success;
}

include 'solution_example.php';

$stdout = STDERR;

$success = assert_result(solution(1, 2), 3, array(1, 2), $success);
$success = assert_result(solution(5, 3), 8, array(5, 3), $success);

if ($success) {
  fwrite($stdout, json_encode(array(
    'status' => 'ok',
    'result' => '__code-0__'
  )) . "\n");
}
