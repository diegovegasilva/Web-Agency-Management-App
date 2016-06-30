<?php

require_once("Rest.inc.php");
require_once("jwt.php");
require_once("connection.php");

class API extends REST {

    public $data = "";
    public $tokenKey = TOKENKEY;
    const DB_SERVER = DB_SERVER;
    const DB_USER = DB_USER;
    const DB_PASSWORD = DB_PASSWORD;
    const DB = DB;

    private $db = NULL;
    private $mysqli = NULL;

    public function __construct() {
        parent::__construct();    // Init parent contructor
        $this->dbConnect();
        // Initiate Database connection
    }

    /*
     *  Connect to Database
     */

    private function dbConnect() {
        $this->mysqli = new mysqli(self::DB_SERVER, self::DB_USER, self::DB_PASSWORD, self::DB);
        $this->mysqli->set_charset("utf8");
    }

    public function test() {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
        $func = strtolower(trim(str_replace("/", "", $_REQUEST['x'])));
        //echo 'function->('.$_REQUEST['x'].')';
        echo $func;
    }

    public function createToken() {
        $JWT = new JWT();
        $token = array(
            "iss" => "http://example.org",
            "aud" => "http://example.com",
            "iat" => time(),
            "nbf" => time(),
            "exp" => time() + 100000
        );
        return $JWT->encode($token, $this->tokenKey);
    }

    public function validateToken($token) {
        $JWT = new JWT();
        $validate = $JWT->decode($token, $this->tokenKey, array('HS256'));
        return $validate;
    }

    public function getToken() {
        if (!function_exists('getallheaders')) {
            function getallheaders() {
                $headers = array();
                foreach ($_SERVER as $name => $value) {
                    if (substr($name, 0, 5) == 'HTTP_') {
                        $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
                    }
                }
                return $headers;
            }

        }
        $response = getallheaders();
        return $response['Token'];
    }

    /*
     * Dynmically call the method based on the query string
     */

    public function processApi() {
        $func = strtolower(trim(str_replace("/", "", $_REQUEST['x'])));
        if ((int) method_exists($this, $func) > 0)
            $this->$func();
        else
            $this->response('', 404); // If the method not exist with in this class "Page not found".
    }

    //CLIENTES

    private function getClients() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $queryLength = "SELECT * from client";
        $query = "SELECT * from client LIMIT $limit OFFSET $offset";
        if (!isset($limit) || !isset($offset)) {
            $query = "SELECT * from client";
        }
        $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        $length = $rLength->num_rows;
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getClient() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT * FROM client WHERE id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getProvinces() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT * from provinces";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $this->response($this->json($result), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getProvince() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT province FROM provinces WHERE id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function addClient() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $client = json_decode(file_get_contents("php://input"), true);
        $campos_db = array('name', 'email', 'address', 'cif', 'contact', 'phone', 'province', 'city', 'zip');
        $keys = array_keys($client);
        $columns = '';
        $values = '';
        foreach ($campos_db as $desired_key) { // Check the customer received. If blank insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($client[$desired_key]);
            }
            $columns = $columns . $desired_key . ',';
            $values = $values . "'" . $$desired_key . "',";
        }
        $query = "INSERT INTO client(" . trim($columns, ',') . ") VALUES(" . trim($values, ',') . ")";
        if (!empty($client)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Cliente creado correctamente.", "data" => $client);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); //"No Content" status
    }

    private function deleteClient() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "DELETE FROM client WHERE id = $id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Cliente eliminado.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // If no records "No Content" status
    }

    private function editClient() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $client = json_decode(file_get_contents("php://input"), true);
        $id = (int) $client['id'];
        $column_names = array('name', 'email', 'address', 'cif', 'contact', 'phone', 'province', 'city', 'zip');
        $keys = array_keys($client);
        $columns = '';
        $values = '';
        foreach ($column_names as $desired_key) { // Check the customer received. If key does not exist, insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($client[$desired_key]);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE client SET " . trim($columns, ',') . " WHERE id=$id";
        if (!empty($client)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Cliente " . $id . " editado correctamente.", "data" => $client);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }

    private function addComment() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $comment = json_decode(file_get_contents("php://input"), true);
        $campos_db = array('client_id', 'user_id', 'comment');
        $keys = array_keys($comment);
        $columns = '';
        $values = '';
        foreach ($campos_db as $desired_key) { // Check the customer received. If blank insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($comment[$desired_key]);
            }
            $columns = $columns . $desired_key . ',';
            $values = $values . "'" . $$desired_key . "',";
        }
        $query = "INSERT INTO clients_comments(" . trim($columns, ',') . ") VALUES(" . trim($values, ',') . ")";
        if (!empty($comment)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Comentarios añadido correctamente.", "data" => $comment, query => $query);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); //"No Content" status
    }

    private function getComments() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $clientID = (int) $this->_request['clientID'];
        $query = "SELECT clients_comments.*, user_images.url, users.username from clients_comments LEFT JOIN user_images ON clients_comments.user_id = user_images.user_id LEFT JOIN users as users ON clients_comments.user_id = users.id WHERE client_id = $clientID";


        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getClientTasks() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $idCliente = (int) $this->_request['clientID'];
        $query = "SELECT tasks.*, MAX(time_tasks.date) as dateTime, users.username as assignedName, maker.username as makerName
                    FROM tasks
                    LEFT JOIN time_tasks ON task_id = tasks.id
                    LEFT JOIN users ON tasks.assigned = users.id
                    LEFT JOIN users as maker ON tasks.maker = maker.id
                    WHERE tasks.project_id IN (SELECT id FROM projects WHERE client_id = $idCliente)
                    GROUP BY tasks.id
                    ORDER BY dateTime DESC";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    //FAMILIAS

    private function addFamily() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $family = json_decode(file_get_contents("php://input"), true);
        $campos_db = array('name', 'category_id');
        $keys = array_keys($family);
        $columns = '';
        $values = '';
        foreach ($campos_db as $desired_key) {
            if (!in_array($desired_key, $keys)) {
                $$desired_key = 'NULL';
            } else {
                $$desired_key = addslashes($family[$desired_key]);
            }
            $columns = $columns . $desired_key . ',';
            if ($$desired_key == 'NULL') {
                $values = $values . "NULL,";
            } else {
                $values = $values . "'" . $$desired_key . "',";
            }
        }
        $query = "INSERT INTO product_category(" . trim($columns, ',') . ") VALUES(" . trim($values, ',') . ")";
        if (!empty($family)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Familia creada correctamente", "data" => $family);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); //"No Content" status
    }

    private function editFamily() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $family = json_decode(file_get_contents("php://input"), true);
        $id = (int) $family['id'];
        $column_names = array('name', 'category_id');
        $keys = array_keys($family);
        $columns = '';
        $values = '';
        foreach ($column_names as $desired_key) { // Check the customer received. If key does not exist, insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($family[$desired_key]);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE product_category SET " . trim($columns, ',') . " WHERE id=$id";
        if (!empty($family)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Familia " . $id . " editado correctamente.", "data" => $family);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }

    private function deleteFamily() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "DELETE FROM product_category WHERE id = $id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Familia eliminada.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // If no records "No Content" status
    }

    private function getFamily() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT * FROM product_category WHERE id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getRootFamilies() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $query = "SELECT * from product_category WHERE category_id IS NULL LIMIT $limit OFFSET $offset";
        if (!isset($limit) || !isset($offset)) {
            $query = "SELECT * from product_category WHERE category_id IS NULL";
        }
        $queryLength = "SELECT * from product_category WHERE category_id IS NULL";
        $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        $length = $rLength->num_rows;

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getFamilies() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $id = $this->_request['id'];
        if (!isset($limit) || !isset($offset)) {
            $sdf = $offset;
            if ($id == 'null') {
                $query = "SELECT * from product_category";
            } else {
                $query = "SELECT * from product_category WHERE category_id=$id";
            }
        } else {
            $sdf = 'here';
            if ($id == 'null') {
                $query = "SELECT * from product_category LIMIT $limit OFFSET $offset";
                $queryLength = "SELECT * from product_category ";
            } else {
                $query = "SELECT * from product_category WHERE category_id=$id LIMIT $limit OFFSET $offset";
                $queryLength = "SELECT * from product_category WHERE category_id=$id";
            }
        }

        if ($queryLength) {
            $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
            $length = $rLength->num_rows;
        }
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, 'rows' => $r->num_rows, "data" => $result, "length" => $length);
            $this->response($this->json($success), 200); // send user details
        } else {
            $success = array('status' => 0, 'rows' => $r->num_rows, "length" => $length);
            $this->response($this->json($success), 204);
        }// If no records "No Content" status
    }

    private function getFinalFamilies() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $id = $_GET['id'];
        if (!isset($limit) || !isset($offset)) {
            $query = "SELECT id from product_category WHERE category_id=$id";
        } else {
            $query = "SELECT id from product_category WHERE category_id=$id LIMIT $limit OFFSET $offset";
            $queryLength = "SELECT id from product_category WHERE category_id=$id";
            $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
            $length = $rLength->num_rows;
        }
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        $result = array('rows' => $r->num_rows, "length" => $length);
        $this->response($this->json($result), 200);
    }

    //PRODUCTOS

    private function getProducts() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }

        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $familyID = (int) $this->_request['familyID'];
        $order = (int) $this->_request['order'];

        if ($order == 1) {
            $partialQuery = "SELECT id, name, vat";
        } else {
            $partialQuery = 'SELECT *';
        }
        if (!isset($limit) || !isset($offset)) {
            if ($familyID > 0) {
                $query = "$partialQuery FROM products WHERE category_id=$familyID";
            } else {
                $query = "$partialQuery FROM products WHERE active=1";
            }
        } else {
            if ($familyID > 0) {
                $query = "$partialQuery FROM products WHERE category_id=$familyID LIMIT $limit OFFSET $offset";
                $queryLength = "$partialQuery FROM products WHERE category_id=$familyID";
            } else {
                $query = "$partialQuery FROM products WHERE active=1 LIMIT $limit OFFSET $offset";
                $queryLength = "$partialQuery FROM products WHERE active=1";
            }
        }
        if ($queryLength) {
            $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        }
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        $length = $rLength->num_rows;
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length);
            $this->response($this->json($success), 200); // send user details
        } else {
            $this->response('', 204); // If no records "No Content" status
        }
    }

    private function getProduct() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT * FROM products WHERE id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function addProduct() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $product = json_decode(file_get_contents("php://input"), true);
        $campos_db = array('category_id', 'name', 'description', 'stock', 'vat', 'active', 'image');
        $keys = array_keys($product);
        $columns = '';
        $values = '';
        foreach ($campos_db as $desired_key) { // Check the customer received. If blank insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = $product[$desired_key];
            }
            $columns = $columns . $desired_key . ',';
            $values = $values . "'" . $$desired_key . "',";
        }
        $query = "INSERT INTO products (" . trim($columns, ',') . ") VALUES (" . trim($values, ',') . ")";
        if (!empty($product)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 'success', "msg" => "Producto creado correctamente.", "data" => $this->mysqli->insert_id);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); //"No Content" status
    }

    private function addFormat() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $data = json_decode(file_get_contents("php://input"), true);
        $queryconst = '';
        foreach ($data as $key => $value) {
            ksort($value);
            $format[$key] = $value;
            $format_keys = array_keys($format[$key]);
            $newArray = $this->slashesToArray($value);
            $queryconst = $queryconst . '(\'' . implode("','", $newArray) . '\'),';
        }
        $queryconst = rtrim($queryconst, ",");
        $query = "INSERT INTO format (" . implode(",", $format_keys) . ") VALUES " . $queryconst;
        if (!empty($data)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => $query, "msg" => "Precio de producto creado correctamente.", "data" => $data);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204);
    }

    private function deleteProduct() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "DELETE FROM products WHERE id = $id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => "Success", "msg" => "Producto eliminado.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // If no records "No Content" status
    }

    private function editProduct() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $product = json_decode(file_get_contents("php://input"), true);
        $id = (int) $product['id'];
        $column_names = array('category_id', 'name', 'description', 'stock', 'vat', 'active', 'image');
        $keys = array_keys($product);
        $columns = '';
        $values = '';
        foreach ($column_names as $desired_key) { // Check the customer received. If key does not exist, insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($product[$desired_key]);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE products SET " . trim($columns, ',') . " WHERE id=$id";
        if (!empty($product)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => "Success", "msg" => "Producto " . $id . " Updated Successfully.", "data" => $product);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/			
    }

    private function editFormat() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $data = json_decode(file_get_contents("php://input"), true);
        $queryconst = '';
        foreach ($data as $key => $value) {
            ksort($value);
            $format[$key] = $value;
            $format_keys = array_keys($format[$key]);
            $newArray = $this->slashesToArray($value);
            $queryconst = $queryconst . '(\'' . implode("','", $newArray) . '\'),';
        }
        $queryconst = rtrim($queryconst, ",");
        $query = "INSERT INTO format (" . implode(",", $format_keys) . ") VALUES " . $queryconst . " ON DUPLICATE KEY UPDATE price=VALUES(price), name=VALUES(name), units=VALUES(units)";


        if (!empty($data)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => "Success", "query" => $query, "data" => $newArray);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204);
    }

    private function deleteFormat() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $data = json_decode(file_get_contents("php://input"), true);
        foreach ($data as $key => $value) {
            $queryconst = $queryconst . "'" . $value . "',";
        }
        if (!empty($data)) {
            $queryconst = rtrim($queryconst, ",");
            $query = "DELETE FROM format WHERE id in ($queryconst);";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => "Success", "msg" => "Precio eliminado.");
            $this->response($this->json($success), 200);
        } else {
            $this->response('', 204); // If no records "No Content" status
        }
    }

    private function getProductPrice() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = $_GET['id'];
        $query = "SELECT * from format WHERE product_id=$id";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $this->response($this->json($result), 200); // send user details
        } else {
            $result = array('rows' => $r->num_rows);
            $this->response($this->json($result), 204);
        }// If no records "No Content" status
    }

    private function getProductImage() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = $_GET['id'];
        $query = "SELECT * from product_images WHERE product_id=$id";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $this->response($this->json($result), 200); // send user details
        } else {
            $result = array('rows' => $r->num_rows);
            $this->response($this->json($result), 204);
        }// If no records "No Content" status
    }

    private function uploadProductImage() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $file_name = $_FILES['file']['name'];
        $file_tmp = $_FILES['file']['tmp_name'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

        //renombrar
        $arr = explode('.', $file_name);
        array_pop($arr);
        $filename_without_extension = implode('.', $arr);
        $date = date("dmYHis");
        $new_name = $filename_without_extension . '_' . $date . '.' . $file_ext;

        //validar
        $extensions = array("jpeg", "jpg", "png");
        if (in_array($file_ext, $extensions) === false) {
            $errors[] = "tipo de imagen no válida, solo se admiten .jpg o .png";
        }
        if ($file_size > 10485760) {
            $errors[] = 'el tamaño de la imagen no puede ser superior a 10MB';
        }
        if (empty($errors) == true) {
            if (move_uploaded_file($file_tmp, "../upload/" . $new_name)) {
                $query = "INSERT INTO product_images (url) VALUES ('" . $new_name . "')";
                $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
                $status = 1;
            } else {
                $status = 0;
            };
        } else {
            $status = 2;
        }

        $success = array('status' => $status, 'errors' => $errors, "data" => $this->mysqli->insert_id, 'src' => $new_name);
        $this->response($this->json($success), 200);
    }

    private function deleteProductImage() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT url FROM product_images WHERE id = $id LIMIT 1";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $result = $r->fetch_assoc();
            $name = $result['url'];
            if (unlink("../upload/" . $name)) {
                $query = "DELETE FROM product_images WHERE id = $id";
                $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
                $success = array('url' => $result['url'], 'id' => $id, "query" => $query);
                $this->response($this->json($success), 200);
            };
        } else {
            $this->response('', 204);
        }
    }

    private function saveProductImage() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'];
        $product_id = $data['productID'];
        if ($id > 0) {
            $query = "UPDATE product_images SET product_id = '$product_id' WHERE id = '$id'";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('url' => $product_id, 'id' => $id, "data" => $data);
            $this->response($this->json($success), 200);
        } else {
            $this->response('', 204);
        }
    }

    //PEDIDOS

    private function getPrice() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT price FROM format WHERE id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function addOrder() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $order = json_decode(file_get_contents("php://input"), true);
        $campos_db = array('price', 'vat', 'client_id', 'client_name', 'discount', 'total');
        $keys = array_keys($order);
        $columns = '';
        $values = '';
        $date = date('Y-m-d');
        foreach ($campos_db as $desired_key) { // Check the customer received. If blank insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($order[$desired_key]);
            }
            $columns = $columns . $desired_key . ',';
            $values = $values . "'" . $$desired_key . "',";
        }
        $query = "INSERT INTO orders(" . trim($columns, ',') . ", date) VALUES(" . trim($values, ',') . ",'$date')";
        if (!empty($order)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Pedido creado correctamente.", "data" => $this->mysqli->insert_id);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); //"No Content" status
    }

    private function addOrderLines() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $data = json_decode(file_get_contents("php://input"), true);

        $order_id = $data['orderID'];
        $products = $data['products'];
        $campos_db = array('product_id', 'product_name', 'units', 'price', 'vat', 'vat_percent', 'discount', 'product_format', 'format_id', 'vat_id', 'unit_price', 'order_id');
        $campos_obj = array('id', 'name', 'units', 'priceVal', 'vatVal', 'vatPercent', 'discount', 'formatName', 'price', 'vat', 'unitPrice');

        $values = '';
        foreach ($products as $key => $producto) {

            $keys = array_keys($producto);
            $columns = '';

            foreach ($campos_obj as $desired_key) {
                if (!in_array($desired_key, $keys)) {
                    $$desired_key = '';
                } else {
                    $$desired_key = $producto[$desired_key];
                }
                $columns = $columns . $desired_key . ',';
                $values = $values . "'" . $$desired_key . "',";
            }
            $values = $values . "'" . $order_id . "'),(";
        }
        $query = "INSERT INTO order_lines (" . implode($campos_db, ',') . ") VALUES (" . rtrim($values, ',(');
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        $success = array('status' => $query, "msg" => "Pedido creado correctamente.", "data" => $data);
        $this->response($this->json($success), 200);
    }

    private function editOrder() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $order = json_decode(file_get_contents("php://input"), true);
        $id = (int) $order['id'];
        $column_names = array('price', 'vat', 'discount', 'total');
        $keys = array_keys($order);
        $columns = '';
        $values = '';
        foreach ($column_names as $desired_key) { // Check the customer received. If key does not exist, insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($order[$desired_key]);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE orders SET " . trim($columns, ',') . " WHERE id=$id";
        if (!empty($order)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Pedido editado correctamente", "data" => $order);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }

    private function editOrderLines() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $data = json_decode(file_get_contents("php://input"), true);

        $order_id = $data['orderID'];
        $products = $data['products'];

        $campos_db = array('id', 'product_name', 'units', 'price', 'vat', 'vat_percent', 'discount', 'product_format', 'format_id', 'product_id', 'vat_id', 'unit_price', 'order_id');
        $campos_obj = array('idLine', 'name', 'units', 'priceVal', 'vatVal', 'vatPercent', 'discount', 'formatName', 'price', 'id', 'vat', 'unitPrice');

        $values = '';
        $idLines = '';
        foreach ($products as $key => $producto) {

            $keys = array_keys($producto);
            $columns = '';

            foreach ($campos_obj as $desired_key) {
                if (!in_array($desired_key, $keys)) {
                    $$desired_key = '';
                } else {
                    $$desired_key = $producto[$desired_key];
                }
                $columns = $columns . $desired_key . ',';
                $values = $values . "'" . $$desired_key . "',";
                if ($desired_key == $campos_obj[0]) {
                    if (!empty($$desired_key)) {
                        $idLines = $idLines . $$desired_key . ",";
                    }
                }
            }
            $values = $values . "'" . $order_id . "'),(";
        }
        $query = "INSERT INTO order_lines (" . implode($campos_db, ',') . ") VALUES (" . rtrim($values, ',(') . " ON DUPLICATE KEY UPDATE product_name=VALUES(product_name), units=VALUES(units), price=VALUES(price), vat=VALUES(vat), vat_percent=VALUES(vat_percent), discount=VALUES(discount),  product_format=VALUES(product_format), format_id=VALUES(format_id), unit_price=VALUES(unit_price)";
        $query2 = "DELETE FROM order_lines WHERE order_id=" . $order_id . " AND id NOT IN (" . rtrim($idLines, ',') . ")";

        $r2 = $this->mysqli->query($query2);
        $r = $this->mysqli->query($query);

        $success = array('status' => $query, "msg" => $query2, "data" => $data);
        $this->response($this->json($success), 200);
    }

    private function getOrder() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT * FROM orders WHERE id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getOrderLines() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT * from order_lines WHERE order_id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

            if ($r->num_rows > 0) {
                $result = array();
                while ($row = $r->fetch_assoc()) {
                    $result[] = $row;
                }
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getOrders() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $clientID = (int) $this->_request['clientID'];
        $limit = $this->_request['perPage'];
        $accepted = (int) $this->_request['type'];
        $offset = $this->_request['offset'];
        if ($accepted == 1) {
            $where = 'accepted = 1';
        } else {
            $where = 'accepted = 0';
        }
        if ($clientID) {
            $query = "SELECT orders.*, 
                        (SELECT COUNT(id) FROM invoices WHERE order_id = orders.id AND status = 2) as payed
                        FROM orders
                        LEFT JOIN invoices ON orders.id = invoices.order_id 
                        WHERE client_id=$clientID
                        GROUP BY orders.id
                        ORDER BY id DESC LIMIT $limit OFFSET $offset";
            $queryLength = "SELECT orders.*, 
                        (SELECT COUNT(id) FROM invoices WHERE order_id = orders.id AND status = 2) as payed
                        FROM orders
                        LEFT JOIN invoices ON orders.id = invoices.order_id 
                        WHERE client_id=$clientID
                        GROUP BY orders.id";
        } else {
            $query = "SELECT orders.*, 
                        (SELECT COUNT(id) FROM invoices WHERE order_id = orders.id AND status = 2) as payed
                        FROM orders
                        LEFT JOIN invoices ON orders.id = invoices.order_id 
                        WHERE $where
                        GROUP BY orders.id
                        ORDER BY id DESC LIMIT $limit OFFSET $offset";

            $queryLength = "SELECT orders.*, 
                        (SELECT COUNT(id) FROM invoices WHERE order_id = orders.id AND status = 2) as payed
                        FROM orders
                        LEFT JOIN invoices ON orders.id = invoices.order_id 
                        WHERE $where
                        GROUP BY orders.id";
        }


        $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        $length = $rLength->num_rows;

        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204);
    }

    private function deleteOrder() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "DELETE FROM orders WHERE id = $id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Pedido eliminado.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // If no records "No Content" status
    }

    private function acceptOrder() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $object = json_decode(file_get_contents("php://input"), true);
        $order = $object['order'];
        $project = $object['project'];
        $id = (int) $order['id'];
        $orderDetails = "SELECT vat,price FROM orders WHERE id = " . $id;
        $rOrders = $this->mysqli->query($orderDetails) or die($this->mysqli->error . __LINE__);
        while ($rowOrder = $rOrders->fetch_assoc()) {
            $order['vat'] = $rowOrder['vat'];
            $order['price'] = $rowOrder['price'];
        }
        $campos_db = array('name', 'order_id', 'client_id', 'end_date', 'hours_budget');
        $keys = array_keys($project);
        $columns = '';
        $values = '';
        $date = date('Y-m-d');
        foreach ($campos_db as $desired_key) {
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($project[$desired_key]);
            }
            $columns = $columns . $desired_key . ',';
            $values = $values . "'" . $$desired_key . "',";
        }
        $query = "INSERT INTO projects(" . trim($columns, ',') . ", date) VALUES(" . trim($values, ',') . ",'$date')";
        if (!empty($project)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $order['accepted'] = 1;
            $order['project_id'] = $this->mysqli->insert_id;
            $column_names = array('accepted', 'payment_method', 'installments', 'project_id');
            $keys = array_keys($order);
            $columns = '';
            foreach ($column_names as $desired_key) {
                if (!in_array($desired_key, $keys)) {
                    $$desired_key = '';
                } else {
                    $$desired_key = addslashes($order[$desired_key]);
                }
                $columns = $columns . $desired_key . "='" . $$desired_key . "',";
            }
            $query2 = "UPDATE orders SET invoices = (SELECT installments FROM installments WHERE id =" . $order['installments'] . "), " . trim($columns, ',') . " WHERE id=$id;";

            $inst = "SELECT * FROM installments WHERE id = " . $order['installments'];
            $r = $this->mysqli->query($inst) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $total = $order['total'];
                $vat = $order['vat'];
                $price = $order['price'];
                while ($row = $r->fetch_assoc()) {
                    $payments = $row['payments'];
                    $installments = (int) $row['installments'];
                }
                $percent = explode('+', $payments);
                $val = '';
                for ($i = 0; $i < $installments; $i++) {
                    if ($i == $installments - 1) {
                        $part = round($total, 2);
                        $partVat = round($vat, 2);
                        $partPrice = round($price, 2);
                    } else {
                        $part = round($order['total'] * $percent[$i], 2);
                        $total = $total - $part;
                        
                        $partVat = round($order['vat'] * $percent[$i], 2);
                        $vat = $vat - $partVat;
                        
                        $partPrice = round($order['price'] * $percent[$i], 2);
                        $price = $price - $partPrice;
                    }
                    $installment_number = $i+1;
                    $val .= '(' . $id . ',' . $percent[$i] . ',' . $part . ',' . $order['total'] . ',' . $partVat . ','. $partPrice .','. $installment_number .'),';
                }
                $query2.= "INSERT INTO invoices (order_id, percentage, subTotal, total, vat, base, installment_num) VALUES " . trim($val, ',') . ";";
                if (!empty($order)) {
                    $r = $this->mysqli->multi_query($query2) or die($this->mysqli->error . __LINE__);
                    $success = array('status' => 1, "msg" => "Pedido aceptado correctamente", "data" => $order['vat'], 'query' => $order['price'], 'query2' => $query2);
                    $this->response($this->json($success), 200);
                }
            }
        }
    }

    private function getPaymentMethods() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT * from payment_methods";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $this->response($this->json($result), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getInstallments() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT * from installments";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $this->response($this->json($result), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getInvoices() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $clientID = (int) $this->_request['clientID'];
        $orderID = (int) $this->_request['orderID'];
        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $type = $this->_request['type'];
        if ($type != 'null') {
            if (!$orderID && !$clientID) {
                $sort = "WHERE status = $type";
            } else {
                $sort = "AND status = $type";
            }
        } else {
            $sort = '';
        }
        if ($orderID) {
            $query = "SELECT invoices.*, orders.price, orders.vat, orders.total, orders.client_name FROM invoices LEFT JOIN orders ON invoices.order_id = orders.id WHERE order_id = $orderID $sort ORDER BY invoices.invoice_num DESC LIMIT $limit OFFSET $offset";
            $queryLength = "SELECT invoices.*, orders.price, orders.vat, orders.total, orders.client_name FROM invoices LEFT JOIN orders ON invoices.order_id = orders.id WHERE order_id = $orderID $sort";
        } elseif ($clientID) {
            $query = "SELECT invoices.*, orders.price, orders.vat, orders.total, orders.client_name, orders.client_id FROM invoices LEFT JOIN orders ON invoices.order_id = orders.id WHERE orders.client_id = $clientID $sort ORDER BY invoices.invoice_num DESC LIMIT $limit OFFSET $offset";
            $queryLength = "SELECT invoices.*, orders.price, orders.vat, orders.total, orders.client_name, orders.client_id FROM invoices LEFT JOIN orders ON invoices.order_id = orders.id WHERE orders.client_id = $clientID $sort";
        } else {
            $query = "SELECT invoices.*, orders.price, orders.vat, orders.total, orders.client_name, orders.client_id FROM invoices LEFT JOIN orders ON invoices.order_id = orders.id $sort ORDER BY invoices.invoice_num DESC LIMIT $limit OFFSET $offset";
            $queryLength = "SELECT invoices.*, orders.price, orders.vat, orders.total, orders.client_name, orders.client_id FROM invoices LEFT JOIN orders ON invoices.order_id = orders.id $sort";
        }


        $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        $length = $rLength->num_rows;

        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length, 'query' => $query);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getInvoice() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT invoices.*, 
            orders.client_id, orders.vat, orders.payment_method,
            client.name AS client_name, client.address, client.cif, client.province, client.city, client.zip, 
            provinces.province as provinceName,
            installments.installments
            FROM invoices  
            LEFT JOIN orders ON invoices.order_id = orders.id 
            LEFT JOIN client ON orders.client_id = client.id 
            LEFT JOIN provinces ON client.province = provinces.id
            LEFT JOIN installments ON orders.installments = installments.id
            WHERE invoices.id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function deleteInvoice() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "DELETE FROM invoices WHERE id = $id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Factura eliminada.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // If no records "No Content" status
    }

    private function invoiceChangeStatus() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $object = json_decode(file_get_contents("php://input"), true);
        $id = $object['invoiceID'];
        $status = $object['status'];
        $fecha = date('Y-m-d');
        switch ($status) {
            case '0':
                $val = 1;
                $date = ",date = '$fecha'";
                break;
            case '1':
                $val = 2;
                break;
            default:
                $val = 1;
                $date = '';
                break;
        }
        if($status==0){
            $sql = "SELECT * FROM config_data";
            $r2 = $this->mysqli->query($sql) or die($this->mysqli->error . __LINE__);
            $data = $r2->fetch_assoc();
            $query = "UPDATE invoices as t1, 
                    (SELECT MAX(invoices.invoice_num) AS maxNumber FROM invoices) as t2 
                    SET t1.status = $val " . $date . ",t1.name='".$data['name']."',t1.address='".$data['address']."',
                    t1.cif='".$data['cif']."',t1.zip='".$data['zip']."',t1.province='".$data['province']."',t1.city='".$data['city']."', 
                    t1.invoice_num = t2.maxNumber+1 WHERE id=$id";

        }else{
            $query = "UPDATE invoices SET status = $val " . $date . " WHERE id=$id";
        }
        if (!empty($object)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Factura editada correctamente", 'query' => $query);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }

    private function editInvoice() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $order = json_decode(file_get_contents("php://input"), true);
        $id = (int) $order['id'];
        $column_names = array('price', 'vat', 'discount', 'total', 'date');
        $keys = array_keys($order);
        $columns = '';
        $values = '';
        foreach ($column_names as $desired_key) { // Check the customer received. If key does not exist, insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($order[$desired_key]);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE orders SET " . trim($columns, ',') . " WHERE id=$id";
        if (!empty($order)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Pedido editado correctamente", "data" => $order);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }

    //LOGIN

    private function login() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        $user = json_decode(file_get_contents("php://input"), true);
        $username = $user['username'];
        $password = $user['password'];
        if (!empty($username) and ! empty($password)) {
            $query = "SELECT users.id, users.userRol, users.username, user_images.url FROM (SELECT * FROM users WHERE username='$username' AND password = '" . md5($password) . "' LIMIT 1) as users LEFT JOIN (SELECT * FROM user_images) as user_images ON user_images.user_id = users.id";
//            $query = "SELECT id, username, userRol FROM users WHERE username = '$username' AND password = '" . md5($password) . "' LIMIT 1";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

            if ($r->num_rows > 0) {
                $tok = $this->createToken();
                $result = $r->fetch_assoc();
                // If success everythig is good send header as "OK" and user details
                $success = array('status' => 200, "data" => $result, "token" => $tok);
                $this->response($this->json($success), 200);
            }
            $this->response('', 403); // If no records "No Content" status
        }
        $error = array('status' => "401", "msg" => "Invalid Email address or Password");
        $this->response($this->json($error), 403);
    }

    //CONFIG

    private function getUserData() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT config_data.*, provinces.province as provinceName
FROM config_data
LEFT JOIN provinces 
ON config_data.province = provinces.id";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        if ($r->num_rows > 0) {
            $result = $r->fetch_assoc();
            $this->response($this->json($result), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function editUserData() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $user = json_decode(file_get_contents("php://input"), true);
        $column_names = array('name', 'email', 'address', 'cif', 'contact', 'phone', 'province', 'city', 'zip');
        $keys = array_keys($user);
        $columns = '';
        $values = '';
        foreach ($column_names as $desired_key) { // Check the customer received. If key does not exist, insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($user[$desired_key]);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE config_data SET " . trim($columns, ',') . "";
        if (!empty($user)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Usuario " . $id . " editado correctamente.", "data" => $user);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }

    private function uploadInvoiceImage() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }

        $file_name = $_FILES['file']['name'];
        $file_tmp = $_FILES['file']['tmp_name'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

        //renombrar
        $arr = explode('.', $file_name);
        array_pop($arr);
        $filename_without_extension = implode('.', $arr);
        $date = date("dmYHis");
        $new_name = $filename_without_extension . '_' . $date . '.' . $file_ext;

        //validar
        $extensions = array("jpeg", "jpg", "png");
        if (in_array($file_ext, $extensions) === false) {
            $errors[] = "tipo de imagen no válida, solo se admiten .jpg o .png";
        }
        if ($file_size > 10485760) {
            $errors[] = 'el tamaño de la imagen no puede ser superior a 10MB';
        }
        if (empty($errors) == true) {
            if (move_uploaded_file($file_tmp, "../upload/" . $new_name)) {
                $query = "UPDATE config_data SET image = '$new_name'";
                $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
                $status = 1;
            } else {
                $status = 0;
            };
        } else {
            $status = 2;
        }

        $success = array('status' => $status, 'errors' => $errors, 'src' => $new_name);
        $this->response($this->json($success), 200);
    }

    private function deleteInvoiceImage() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }

        $query = "SELECT image FROM config_data LIMIT 1";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        $result = $r->fetch_assoc();
        $name = $result['image'];
        if (unlink("../upload/" . $name)) {
            $query = "UPDATE config_data SET image = ''";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('url' => $result['image']);
            $this->response($this->json($success), 200);
        } else {
            $this->response('', 204);
        }
    }

    private function getInvoiceImage() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT image FROM config_data";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        if ($r->num_rows > 0) {
            $result = $r->fetch_assoc();
            $this->response($this->json($result), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getVAT() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT * from vat";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $this->response($this->json($result), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getVATPercent() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT vat FROM vat WHERE id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function deleteVat() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "DELETE FROM vat WHERE id = $id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "IVA eliminado.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // If no records "No Content" status
    }

    private function addVat() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $vat = json_decode(file_get_contents("php://input"), true);
        $value = $vat['valor'];
        $query = "INSERT INTO vat (vat) VALUES (" . $value . ")";
        if (!empty($value)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "IVA creado correctamente.", "data" => $value);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); //"No Content" status
    }

    //USUARIOS

    private function getUsers() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }

        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $queryLength = "SELECT * from users WHERE userRol != 0";


        $query = "SELECT * from users WHERE userRol != 0 LIMIT $limit OFFSET $offset";
        if (!isset($limit) || !isset($offset)) {
            $query = "SELECT * from users WHERE userRol != 0";
        }
        $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        $length = $rLength->num_rows;

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getUser() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT * FROM users WHERE id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function deleteUser() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "DELETE FROM users WHERE id = $id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Usuario eliminado.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // If no records "No Content" status
    }

    private function editUser() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $user = json_decode(file_get_contents("php://input"), true);
        $id = (int) $user['id'];
        if (!empty($user['password'])) {
            $campos_db = array('username', 'password', 'email', 'userRol');
        } else {
            $campos_db = array('username', 'email', 'userRol');
        }
        $keys = array_keys($user);
        $columns = '';
        $values = '';
        foreach ($campos_db as $desired_key) {
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($user[$desired_key]);
            }
            if ($desired_key == 'password') {
                $$desired_key = md5($$desired_key);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE users SET " . trim($columns, ',') . " WHERE id=$id";
        if (!empty($user)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Usuario " . $id . " editado correctamente.", "data" => $query);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }

    private function addUser() {

        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $user = json_decode(file_get_contents("php://input"), true);
        $campos_db = array('username', 'password', 'email', 'userRol');
        $keys = array_keys($user);
        $columns = '';
        $values = '';
        foreach ($campos_db as $desired_key) { // Check the customer received. If blank insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($user[$desired_key]);
            }
            if ($desired_key == 'password') {
                $$desired_key = md5($$desired_key);
            }
            $columns = $columns . $desired_key . ',';
            $values = $values . "'" . $$desired_key . "',";
        }
        $query = "INSERT INTO users(" . trim($columns, ',') . ") VALUES(" . trim($values, ',') . ")";
        if (!empty($user)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 'success', "msg" => "Usuario creado correctamente.", "data" => $this->mysqli->insert_id);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); //"No Content" status
    }

    private function uploadUserImage() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $file_name = $_FILES['file']['name'];
        $file_tmp = $_FILES['file']['tmp_name'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

        //renombrar
        $arr = explode('.', $file_name);
        array_pop($arr);
        $filename_without_extension = implode('.', $arr);
        $date = date("dmYHis");
        $new_name = $filename_without_extension . '_' . $date . '.' . $file_ext;

        //validar
        $extensions = array("jpeg", "jpg", "png");
        if (in_array($file_ext, $extensions) === false) {
            $errors[] = "tipo de imagen no válida, solo se admiten .jpg o .png";
        }
        if ($file_size > 10485760) {
            $errors[] = 'el tamaño de la imagen no puede ser superior a 10MB';
        }
        if (empty($errors) == true) {
            if (move_uploaded_file($file_tmp, "../upload/" . $new_name)) {
                $query = "INSERT INTO user_images (url) VALUES ('" . $new_name . "')";
                $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
                $status = 1;
            } else {
                $status = 0;
            };
        } else {
            $status = 2;
        }

        $success = array('status' => $status, 'errors' => $errors, "data" => $this->mysqli->insert_id, 'src' => $new_name);
        $this->response($this->json($success), 200);
    }

    private function saveUserImage() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'];
        $user_id = $data['userID'];
        if ($id > 0) {
            $query = "UPDATE user_images SET user_id = '$user_id' WHERE id = '$id'";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('url' => $user_id, 'id' => $id, "data" => $data);
            $this->response($this->json($success), 200);
        } else {
            $this->response('', 204);
        }
    }

    private function deleteUserImage() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT url FROM user_images WHERE id = $id LIMIT 1";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $result = $r->fetch_assoc();
            $name = $result['url'];
            if (unlink("../upload/" . $name)) {
                $query = "DELETE FROM user_images WHERE id = $id";
                $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
                $success = array('url' => $result['url'], 'id' => $id, "query" => $query);
                $this->response($this->json($success), 200);
            };
        } else {
            $this->response('', 204);
        }
    }

    private function getUserImage() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = $_GET['id'];
        $query = "SELECT * from user_images WHERE user_id=$id";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $this->response($this->json($result), 200); // send user details
        } else {
            $result = array('rows' => $r->num_rows);
            $this->response($this->json($result), 204);
        }// If no records "No Content" status
    }

    private function getRoles() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT * from user_roles";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $this->response($this->json($result), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getRol() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT * FROM user_roles WHERE id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    //PROYECTOS

    private function addProject() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $project = json_decode(file_get_contents("php://input"), true);
        $campos_db = array('name', 'client_id', 'end_date', 'hours_budget');
        $keys = array_keys($project);
        $columns = '';
        $values = '';
        $date = date('Y-m-d');
        foreach ($campos_db as $desired_key) { // Check the customer received. If blank insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($project[$desired_key]);
            }
            $columns = $columns . $desired_key . ',';
            $values = $values . "'" . $$desired_key . "',";
        }
        $query = "INSERT INTO projects(" . trim($columns, ',') . ", date) VALUES(" . trim($values, ',') . ",'$date')";
        if (!empty($project)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Proyecto creado correctamente.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); //"No Content" status
    }

    private function getProjects() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $clientID = (int) $this->_request['clientID'];
        $orderBy = (int) $this->_request['orderBy'];
        $orderWay = (int) $this->_request['orderWay'];
        if ($orderBy != 'NULL') {
            $order = "ORDER BY projects." . $orderBy . " " . $orderWay;
        } else {
            $order = '';
        }
        if ($clientID) {
            $queryLength = "SELECT projects.*, SUM(time_tasks.hours) as hours_total FROM `projects` LEFT JOIN tasks ON projects.id = tasks.project_id LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id WHERE client_id = '$clientID' GROUP BY projects.id";
            $query = "SELECT projects.*, SUM(time_tasks.hours) as hours_total FROM `projects` LEFT JOIN tasks ON projects.id = tasks.project_id LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id WHERE client_id = '$clientID' GROUP BY projects.id $order LIMIT $limit OFFSET $offset";
        } else {
            $queryLength = "SELECT projects.*, SUM(time_tasks.hours) as hours_total FROM `projects` LEFT JOIN tasks ON projects.id = tasks.project_id LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id GROUP BY projects.id";
            $query = "SELECT projects.*, SUM(time_tasks.hours) as hours_total FROM `projects` LEFT JOIN tasks ON projects.id = tasks.project_id LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id GROUP BY projects.id $order LIMIT $limit OFFSET $offset";
        }
        if (!isset($limit) || !isset($offset)) {
            $query = $queryLength;
        }
        $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        $length = $rLength->num_rows;
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getActiveProjects() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $clientID = (int) $this->_request['clientID'];
        if ($clientID) {
            $queryLength = "SELECT projects.*, SUM(time_tasks.hours) as hours_total FROM `projects` LEFT JOIN tasks ON projects.id = tasks.project_id LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id WHERE client_id = '$clientID' AND projects.status = 1 GROUP BY projects.id";
            $query = "SELECT projects.*, SUM(time_tasks.hours) as hours_total FROM `projects` LEFT JOIN tasks ON projects.id = tasks.project_id LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id WHERE client_id = '$clientID' AND projects.status = 1 GROUP BY projects.id LIMIT $limit OFFSET $offset";
        } else {
            $queryLength = "SELECT projects.*, SUM(time_tasks.hours) as hours_total FROM `projects` LEFT JOIN tasks ON projects.id = tasks.project_id LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id WHERE projects.status = 1 GROUP BY projects.id";
            $query = "SELECT projects.*, SUM(time_tasks.hours) as hours_total FROM `projects` LEFT JOIN tasks ON projects.id = tasks.project_id LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id WHERE projects.status = 1 GROUP BY projects.id LIMIT $limit OFFSET $offset";
        }
        if (!isset($limit) || !isset($offset)) {
            $query = $queryLength;
        }
        $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        $length = $rLength->num_rows;
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function deleteProject() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "DELETE FROM projects WHERE id = $id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Proyecto eliminado.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // If no records "No Content" status
    }

    private function getProject() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {

            $query = "SELECT projects.*, SUM(time_tasks.hours) as hours_total FROM `projects` LEFT JOIN tasks ON projects.id = tasks.project_id LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id WHERE projects.id = $id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function editProject() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $project = json_decode(file_get_contents("php://input"), true);
        $id = (int) $project['id'];
        $column_names = array('name', 'end_date', 'hours_budget', 'status');
        $keys = array_keys($project);
        $columns = '';
        $values = '';
        foreach ($column_names as $desired_key) { // Check the customer received. If key does not exist, insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($project[$desired_key]);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE projects SET " . trim($columns, ',') . " WHERE id=$id";
        if (!empty($project)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Proyecto " . $id . " editado correctamente.", "data" => $project);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }

    private function setProjectStatus() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $project = json_decode(file_get_contents("php://input"), true);
        $id = (int) $project['id'];
        $column_names = array('status');
        $keys = array_keys($project);
        $columns = '';
        $values = '';
        foreach ($column_names as $desired_key) { // Check the customer received. If key does not exist, insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($project[$desired_key]);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE projects SET " . trim($columns, ',') . " WHERE id=$id";
        if (!empty($project)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Estado " . $id . " editado correctamente.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }

    private function addTask() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $project = json_decode(file_get_contents("php://input"), true);
        $campos_db = array('project_id', 'name', 'maker', 'assigned', 'status', 'hours_budget', 'description');
        $keys = array_keys($project);
        $columns = '';
        $values = '';
        $date = date('Y-m-d');
        foreach ($campos_db as $desired_key) { // Check the customer received. If blank insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($project[$desired_key]);
            }
            $columns = $columns . $desired_key . ',';
            $values = $values . "'" . $$desired_key . "',";
        }
        $query = "INSERT INTO tasks(" . trim($columns, ',') . ", date) VALUES(" . trim($values, ',') . ",'$date')";
        if (!empty($project)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Tarea creado correctamente.", "data" => $query);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); //"No Content" status
    }

    private function getTasks() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $projectID = $this->_request['projectID'];
        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $queryLength = "SELECT tasks.date, tasks.name, tasks.status, tasks.hours_budget, tasks.id, tasks.maker, tasks.assigned, users.username as assignedName, maker.username as makerName, SUM(time_tasks.hours) as hours_cons "
                . "FROM tasks "
                . "LEFT JOIN users ON tasks.assigned = users.id "
                . "LEFT JOIN users as maker ON tasks.maker = maker.id "
                . "LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id "
                . "WHERE tasks.project_id = '$projectID' "
                . "GROUP BY tasks.id "
                . "ORDER BY date";
        $query = "SELECT tasks.date, tasks.name, tasks.status, tasks.hours_budget, tasks.id, tasks.maker, tasks.assigned, users.username as assignedName, maker.username as makerName, SUM(time_tasks.hours) as hours_cons "
                . "FROM tasks "
                . "LEFT JOIN users ON tasks.assigned = users.id "
                . "LEFT JOIN users as maker ON tasks.maker = maker.id "
                . "LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id "
                . "WHERE tasks.project_id = '$projectID' "
                . "GROUP BY tasks.id "
                . "ORDER BY date DESC "
                . "LIMIT $limit OFFSET $offset";
        if (!isset($limit) || !isset($offset)) {
            $query = $queryLength;
        }
        $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        $length = $rLength->num_rows;
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getClientAllTasks() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $clientID = $this->_request['clientID'];
        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $queryLength = "SELECT tasks.date, tasks.name, tasks.status, tasks.hours_budget, tasks.id, tasks.maker, tasks.assigned, users.username as assignedName, maker.username as makerName, SUM(time_tasks.hours) as hours_cons "
                . "FROM tasks "
                . "LEFT JOIN users ON tasks.assigned = users.id "
                . "LEFT JOIN users as maker ON tasks.maker = maker.id "
                . "LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id "
                . "WHERE tasks.project_id IN (SELECT id FROM projects WHERE client_id = $clientID)"
                . "GROUP BY tasks.id "
                . "ORDER BY date";
        $query = "SELECT tasks.date, tasks.name, tasks.status, tasks.hours_budget, tasks.id, tasks.maker, tasks.assigned, users.username as assignedName, maker.username as makerName, SUM(time_tasks.hours) as hours_cons "
                . "FROM tasks "
                . "LEFT JOIN users ON tasks.assigned = users.id "
                . "LEFT JOIN users as maker ON tasks.maker = maker.id "
                . "LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id "
                . "WHERE tasks.project_id IN (SELECT id FROM projects WHERE client_id = $clientID)"
                . "GROUP BY tasks.id "
                . "ORDER BY date DESC "
                . "LIMIT $limit OFFSET $offset";
        if (!isset($limit) || !isset($offset)) {
            $query = $queryLength;
        }
        $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        $length = $rLength->num_rows;
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getUserTasks() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $userID = $this->_request['userID'];
        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $type = $this->_request['type'];
        if ($type == 0) {
            $where = "WHERE tasks.assigned = '$userID'";
        } else {
            $where = "WHERE tasks.maker = '$userID'";
        }
        $queryLength = "SELECT tasks.date, tasks.name, tasks.status, tasks.hours_budget, tasks.id, tasks.maker, tasks.assigned, users.username as assignedName, maker.username as makerName, SUM(time_tasks.hours) as hours_cons "
                . "FROM tasks "
                . "LEFT JOIN users ON tasks.assigned = users.id "
                . "LEFT JOIN users as maker ON tasks.maker = maker.id "
                . "LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id "
                . "$where"
                . "GROUP BY tasks.id "
                . "ORDER BY date";
        $query = "SELECT tasks.date, tasks.name, tasks.status, tasks.hours_budget, tasks.id, tasks.maker, tasks.assigned, users.username as assignedName, maker.username as makerName, SUM(time_tasks.hours) as hours_cons "
                . "FROM tasks "
                . "LEFT JOIN users ON tasks.assigned = users.id "
                . "LEFT JOIN users as maker ON tasks.maker = maker.id "
                . "LEFT JOIN time_tasks ON tasks.id = time_tasks.task_id "
                . "$where"
                . "GROUP BY tasks.id "
                . "ORDER BY date DESC "
                . "LIMIT $limit OFFSET $offset";
        if (!isset($limit) || !isset($offset)) {
            $query = $queryLength;
        }
        $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        $length = $rLength->num_rows;
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length, 'query' => $type);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getTask() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT tasks.*, projects.name as project_name FROM tasks LEFT JOIN projects ON projects.id = tasks.project_id WHERE tasks.id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function deleteTask() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "DELETE FROM tasks WHERE id = $id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Tarea eliminado.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // If no records "No Content" status
    }

    private function editTask() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $project = json_decode(file_get_contents("php://input"), true);
        $id = (int) $project['id'];
        $column_names = array('name', 'assigned', 'status', 'description', 'hours_budget');
        $keys = array_keys($project);
        $columns = '';
        $values = '';
        foreach ($column_names as $desired_key) { // Check the customer received. If key does not exist, insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($project[$desired_key]);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE tasks SET " . trim($columns, ',') . " WHERE id=$id";
        if (!empty($project)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Tarea " . $id . " editado correctamente.", "data" => $project);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }

    private function setTaskStatus() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $task = json_decode(file_get_contents("php://input"), true);
        $id = (int) $task['id'];
        $column_names = array('status');
        $keys = array_keys($task);
        $columns = '';
        $values = '';
        foreach ($column_names as $desired_key) { // Check the customer received. If key does not exist, insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($task[$desired_key]);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE tasks SET " . trim($columns, ',') . " WHERE id=$id";
        if (!empty($task)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Estado " . $id . " editado correctamente.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }

    private function addTaskTime() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $taskTime = json_decode(file_get_contents("php://input"), true);
        $campos_db = array('task_id', 'hours', 'user', 'comments');
        $keys = array_keys($taskTime);
        $columns = '';
        $values = '';
        $date = date('Y-m-d');
        foreach ($campos_db as $desired_key) { // Check the customer received. If blank insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($taskTime[$desired_key]);
            }
            $columns = $columns . $desired_key . ',';
            $values = $values . "'" . $$desired_key . "',";
        }
        $query = "INSERT INTO time_tasks(" . trim($columns, ',') . ", date) VALUES(" . trim($values, ',') . ",'$date')";
        if (!empty($taskTime)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Horas apuntadas correctamente.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); //"No Content" status
    }

    private function getTaskTime() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $taskID = $this->_request['id'];
        $query = "SELECT time_tasks.*, user_images.url, users.username FROM time_tasks LEFT JOIN user_images ON time_tasks.user = user_images.user_id LEFT JOIN users as users ON time_tasks.user = users.id WHERE task_id = $taskID";

        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        if ($r->num_rows > 0) {
            $result = array();
            $totalTime = 0;
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
                $totalTime += $row['hours'];
            }
            $success = array('status' => 1, "data" => $result, 'totalTime' => $totalTime);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }


    
    
    //GASTOS
    
    private function getExpenses() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $queryLength = "SELECT expenses.*, expenses_frequency.`name` as frequencyName, users.username as username
FROM expenses LEFT JOIN expenses_frequency ON expenses.frequency = expenses_frequency.id LEFT JOIN users ON expenses.user_id = users.id";
        $query = "SELECT expenses.*, expenses_frequency.`name` as frequencyName, users.username as username
FROM expenses LEFT JOIN expenses_frequency ON expenses.frequency = expenses_frequency.id LEFT JOIN users ON expenses.user_id = users.id ORDER BY expenses.date DESC LIMIT $limit OFFSET $offset";
        if (!isset($limit) || !isset($offset)) {
            $query = $queryLength;
        }
        $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        $length = $rLength->num_rows;
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getExpense() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT * FROM expenses WHERE id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getExpenseRecurrent() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "SELECT * FROM expenses_cron WHERE id=$id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            if ($r->num_rows > 0) {
                $result = $r->fetch_assoc();
                $this->response($this->json($result), 200); // send user details
            }
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getExpensesRecurrent() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $limit = $this->_request['perPage'];
        $offset = $this->_request['offset'];
        $queryLength = "SELECT expenses_cron.*, expenses_frequency.`name` as frequencyName, users.username as username
FROM expenses_cron LEFT JOIN expenses_frequency ON expenses_cron.frequency = expenses_frequency.id LEFT JOIN users ON expenses_cron.user_id = users.id";
        $query = "SELECT expenses_cron.*, expenses_frequency.`name` as frequencyName, users.username as username
FROM expenses_cron LEFT JOIN expenses_frequency ON expenses_cron.frequency = expenses_frequency.id LEFT JOIN users ON expenses_cron.user_id = users.id LIMIT $limit OFFSET $offset";
        if (!isset($limit) || !isset($offset)) {
            $query = $queryLength;
        }
        $rLength = $this->mysqli->query($queryLength) or die($this->mysqli->error . __LINE__);
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        $length = $rLength->num_rows;
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result, "length" => $length);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getExpensesFrequency() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }


        $query = "SELECT * from expenses_frequency";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function addExpenses() {
        if ($this->get_request_method() != "POST") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $expenses = json_decode(file_get_contents("php://input"), true);
        $campos_db = array('name', 'amount', 'user_id', 'frequency', 'date');
        $keys = array_keys($expenses);
        $columns = '';
        $values = '';
        foreach ($campos_db as $desired_key) { // Check the customer received. If blank insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($expenses[$desired_key]);
            }
            $columns = $columns . $desired_key . ',';
            $values = $values . "'" . $$desired_key . "',";
        }
        $query = "INSERT INTO expenses(" . trim($columns, ',') . ") VALUES(" . trim($values, ',') . ")";
        if (!empty($expenses)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Gastos insertados correctamente.", "data" => date_default_timezone_get(), 'query' =>$query);
            if($expenses['frequency'] != 1){
                $this->addExpensesCron($expenses);
            }
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); //"No Content" status
    }
    
    private function addExpensesCron($expenses) {
        if(!isset($expenses['user_id'])){
            $campos_db = array('name', 'amount', 'frequency', 'date');
        }else{
            $campos_db = array('name', 'amount', 'user_id', 'frequency', 'date');
        }
        $keys = array_keys($expenses);
        $columns = '';
        $values = '';
        foreach ($campos_db as $desired_key) { // Check the customer received. If blank insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($expenses[$desired_key]);
            }
            $columns = $columns . $desired_key . ',';
            $values = $values . "'" . $$desired_key . "',";
        }
        $query = "INSERT INTO expenses_cron(" . trim($columns, ',') . ") VALUES(" . trim($values, ',') . ")";
        if (!empty($expenses)) {
           $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        }
    }
    
    private function editExpenses() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $expenses = json_decode(file_get_contents("php://input"), true);
        $id = (int) $expenses['id'];
        if(!isset($expenses['user_id'])){
            $column_names = array('name', 'amount', 'date');
        }else{
            $column_names = array('name', 'amount', 'user_id', 'date');
        }
        $keys = array_keys($expenses);
        $columns = '';
        $values = '';
        foreach ($column_names as $desired_key) { // Check the customer received. If key does not exist, insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($expenses[$desired_key]);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE expenses SET " . trim($columns, ',') . " WHERE id=$id";
        if (!empty($expenses)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Gasto " . $id . " editado correctamente.", "data" => $expenses);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }
    
    private function editExpensesRecurrent() {
        if ($this->get_request_method() != "PUT") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $expenses = json_decode(file_get_contents("php://input"), true);
        $id = (int) $expenses['id'];
        if(!isset($expenses['user_id'])){
            $column_names = array('name', 'amount', 'frequency', 'date');
        }else{
            $column_names = array('name', 'amount', 'user_id', 'frequency', 'date');
        }
        $keys = array_keys($expenses);
        $columns = '';
        $values = '';
        foreach ($column_names as $desired_key) { // Check the customer received. If key does not exist, insert blank into the array.
            if (!in_array($desired_key, $keys)) {
                $$desired_key = '';
            } else {
                $$desired_key = addslashes($expenses[$desired_key]);
            }
            $columns = $columns . $desired_key . "='" . $$desired_key . "',";
        }
        $query = "UPDATE expenses_cron SET " . trim($columns, ',') . " WHERE id=$id";
        if (!empty($expenses)) {
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Gasto " . $id . " editado correctamente.", "data" => $expenses);
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // "No Content" status*/
    }
    
    private function deleteExpenses() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "DELETE FROM expenses WHERE id = $id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Gasto eliminado.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // If no records "No Content" status
    }
    
    private function deleteExpensesRecurrent() {
        if ($this->get_request_method() != "DELETE") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $id = (int) $this->_request['id'];
        if ($id > 0) {
            $query = "DELETE FROM expenses_cron WHERE id = $id";
            $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
            $success = array('status' => 1, "msg" => "Gasto eliminado.");
            $this->response($this->json($success), 200);
        } else
            $this->response('', 204); // If no records "No Content" status
    }
    
    
    //GRAFICAS

    private function getLastYearProjects() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT count(projects.id) as projects,
                CASE 
                    WHEN (m=1) then 'Ene' 
                    WHEN (m=2) then 'Feb'
                    WHEN (m=3) then 'Mar'
                    WHEN (m=4) then 'Abr'
                    WHEN (m=5) then 'May'
                    WHEN (m=6) then 'Jun'
                    WHEN (m=7) then 'Jul'
                    WHEN (m=8) then 'Ago'
                    WHEN (m=9) then 'Sep'
                    WHEN (m=10) then 'Oct'
                    WHEN (m=11) then 'Nov'
                    WHEN (m=12) THEN 'Dic' END as month
                FROM (
                    SELECT y, m
                        FROM
                            (SELECT YEAR(CURDATE()) y UNION ALL SELECT YEAR(CURDATE())-1) as years,
                            (SELECT 1 m UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) as months) as ym
                LEFT JOIN projects
                    ON ym.y = YEAR(projects.date) AND ym.m = MONTH(projects.date)
                WHERE
                  (y=YEAR(CURDATE()) AND m<=MONTH(CURDATE()))
                  OR
                  (y<YEAR(CURDATE()) AND m>MONTH(CURDATE()))
                GROUP BY y, m";


        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getProjectsByYear() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $year = (int) $this->_request['year'];
        if (!$year) {
            $year = date("Y");
        }
        $query = "SELECT
                    Count(case when month(`date`)=1 then id end) As Ene,
                    Count(case when month(`date`)=2 then id end) As Feb,
                    Count(case when month(`date`)=3 then id end) As Mar,
                          Count(case when month(`date`)=4 then id end) As Abr,
                    Count(case when month(`date`)=5 then id end) As May,
                    Count(case when month(`date`)=6 then id end) As Jun,
                          Count(case when month(`date`)=7 then id end) As Jul,
                    Count(case when month(`date`)=8 then id end) As Ago,
                    Count(case when month(`date`)=9 then id end) As Sep,
                          Count(case when month(`date`)=10 then id end) As Oct,
                    Count(case when month(`date`)=11 then id end) As Nov,
                    Count(case when month(`date`)=12 then id end) As Dic
                  FROM projects
                  WHERE Year(`date`) = $year
                  GROUP BY Year(`date`)
                  ORDER BY date ASC";


        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getLastYearAcceptedOrdersAmount() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT y, m, COALESCE(SUM(orders.total),0) as total,
                    CASE 
                        WHEN (m=1) then 'Ene' 
                        WHEN (m=2) then 'Feb'
                        WHEN (m=3) then 'Mar'
                        WHEN (m=4) then 'Abr'
                        WHEN (m=5) then 'May'
                        WHEN (m=6) then 'Jun'
                        WHEN (m=7) then 'Jul'
                        WHEN (m=8) then 'Ago'
                        WHEN (m=9) then 'Sep'
                        WHEN (m=10) then 'Oct'
                        WHEN (m=11) then 'Nov'
                        WHEN (m=12) THEN 'Dic' END as month
                    FROM (
                        SELECT y, m
				FROM
                                    (SELECT YEAR(CURDATE()) y UNION ALL SELECT YEAR(CURDATE())-1) as years,
                                    (SELECT 1 m UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) as months) as ym
                    LEFT JOIN orders
                    ON ym.y = YEAR(orders.date) AND ym.m = MONTH(orders.date) AND orders.accepted = 1
                    WHERE
                        (y=YEAR(CURDATE()) AND m<=MONTH(CURDATE()))
                        OR
                        (y<YEAR(CURDATE()) AND m>MONTH(CURDATE()))
                    GROUP BY y, m";

        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getAcceptedOrdersAmountByYear() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $year = (int) $this->_request['year'];
        if (!$year) {
            $year = date("Y");
        }
        $query = "SELECT
                    COALESCE(SUM(case when month(`date`)=1 then total end),0) As Ene,
                    COALESCE(SUM(case when month(`date`)=2 then total end),0) As Feb,
                    COALESCE(SUM(case when month(`date`)=3 then total end),0) As Mar,
                    COALESCE(SUM(case when month(`date`)=4 then total end),0) As Abr,
                    COALESCE(SUM(case when month(`date`)=5 then total end),0) As May,
                    COALESCE(SUM(case when month(`date`)=6 then total end),0) As Jun,
                    COALESCE(SUM(case when month(`date`)=7 then total end),0) As Jul,
                    COALESCE(SUM(case when month(`date`)=8 then total end),0) As Ago,
                    COALESCE(SUM(case when month(`date`)=9 then total end),0) As Sep,
                    COALESCE(SUM(case when month(`date`)=10 then total end),0) As Oct,
                    COALESCE(SUM(case when month(`date`)=11 then total end),0) As Nov,
                    COALESCE(SUM(case when month(`date`)=12 then total end),0) As Dic
                    FROM orders
                    WHERE Year(`date`) = $year AND accepted = 1
                    GROUP BY Year(`date`)
                    ORDER BY date ASC";


        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getLastYearPayedInvoicesAmount() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT COALESCE(SUM(invoices.subTotal),0) as total,
                    CASE 
                    WHEN (m=1) then 'Ene' 
                    WHEN (m=2) then 'Feb'
                    WHEN (m=3) then 'Mar'
                    WHEN (m=4) then 'Abr'
                    WHEN (m=5) then 'May'
                    WHEN (m=6) then 'Jun'
                    WHEN (m=7) then 'Jul'
                    WHEN (m=8) then 'Ago'
                    WHEN (m=9) then 'Sep'
                    WHEN (m=10) then 'Oct'
                    WHEN (m=11) then 'Nov'
                    WHEN (m=12) THEN 'Dic' END as month
                    FROM (
                    SELECT y, m
                    FROM
                    (SELECT YEAR(CURDATE()) y UNION ALL SELECT YEAR(CURDATE())-1) as years,
                    (SELECT 1 m UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) as months) as ym
                    LEFT JOIN invoices
                    ON ym.y = YEAR(invoices.date) AND ym.m = MONTH(invoices.date) AND invoices.status = 2
                    WHERE
                    (y=YEAR(CURDATE()) AND m<=MONTH(CURDATE()))
                    OR
                    (y<YEAR(CURDATE()) AND m>MONTH(CURDATE()))
                    GROUP BY y, m";

        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getPayedInvoicesAmountByYear() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $year = (int) $this->_request['year'];
        if (!$year) {
            $year = date("Y");
        }
        $query = "SELECT
                    COALESCE(SUM(case when month(`date`)=1 then subTotal end),0) As Ene,
                    COALESCE(SUM(case when month(`date`)=2 then subTotal end),0) As Feb,
                    COALESCE(SUM(case when month(`date`)=3 then subTotal end),0) As Mar,
                    COALESCE(SUM(case when month(`date`)=4 then subTotal end),0) As Abr,
                    COALESCE(SUM(case when month(`date`)=5 then subTotal end),0) As May,
                    COALESCE(SUM(case when month(`date`)=6 then subTotal end),0) As Jun,
                    COALESCE(SUM(case when month(`date`)=7 then subTotal end),0) As Jul,
                    COALESCE(SUM(case when month(`date`)=8 then subTotal end),0) As Ago,
                    COALESCE(SUM(case when month(`date`)=9 then subTotal end),0) As Sep,
                    COALESCE(SUM(case when month(`date`)=10 then subTotal end),0) As Oct,
                    COALESCE(SUM(case when month(`date`)=11 then subTotal end),0) As Nov,
                    COALESCE(SUM(case when month(`date`)=12 then subTotal end),0) As Dic
                    FROM invoices
                    WHERE Year(`date`) = $year AND status = 2
                    GROUP BY Year(`date`)
                    ORDER BY date ASC";


        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getLastYearExpenses() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT COALESCE(SUM(expenses.amount),0) as total,
                    CASE 
                    WHEN (m=1) then 'Ene' 
                    WHEN (m=2) then 'Feb'
                    WHEN (m=3) then 'Mar'
                    WHEN (m=4) then 'Abr'
                    WHEN (m=5) then 'May'
                    WHEN (m=6) then 'Jun'
                    WHEN (m=7) then 'Jul'
                    WHEN (m=8) then 'Ago'
                    WHEN (m=9) then 'Sep'
                    WHEN (m=10) then 'Oct'
                    WHEN (m=11) then 'Nov'
                    WHEN (m=12) THEN 'Dic' END as month
                    FROM (
                    SELECT y, m
                    FROM
                    (SELECT YEAR(CURDATE()) y UNION ALL SELECT YEAR(CURDATE())-1) as years,
                    (SELECT 1 m UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) as months) as ym
                    LEFT JOIN expenses
                    ON ym.y = YEAR(expenses.date) AND ym.m = MONTH(expenses.date)
                    WHERE
                    (y=YEAR(CURDATE()) AND m<=MONTH(CURDATE()))
                    OR
                    (y<YEAR(CURDATE()) AND m>MONTH(CURDATE()))
                    GROUP BY y, m";

        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getExpensesByYear() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $year = (int) $this->_request['year'];
        if (!$year) {
            $year = date("Y");
        }
        $query = "SELECT
                    COALESCE(SUM(case when month(`date`)=1 then amount end),0) As Ene,
                    COALESCE(SUM(case when month(`date`)=2 then amount end),0) As Feb,
                    COALESCE(SUM(case when month(`date`)=3 then amount end),0) As Mar,
                    COALESCE(SUM(case when month(`date`)=4 then amount end),0) As Abr,
                    COALESCE(SUM(case when month(`date`)=5 then amount end),0) As May,
                    COALESCE(SUM(case when month(`date`)=6 then amount end),0) As Jun,
                    COALESCE(SUM(case when month(`date`)=7 then amount end),0) As Jul,
                    COALESCE(SUM(case when month(`date`)=8 then amount end),0) As Ago,
                    COALESCE(SUM(case when month(`date`)=9 then amount end),0) As Sep,
                    COALESCE(SUM(case when month(`date`)=10 then amount end),0) As Oct,
                    COALESCE(SUM(case when month(`date`)=11 then amount end),0) As Nov,
                    COALESCE(SUM(case when month(`date`)=12 then amount end),0) As Dic
                    FROM expenses
                    WHERE Year(`date`) = $year
                    GROUP BY Year(`date`)
                    ORDER BY date ASC";


        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);

        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    private function getSentInvoicesCount() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT COUNT(id) as total FROM invoices WHERE `status` = 1";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getActiveProjectsCount() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT COUNT(id) as total FROM projects WHERE `status` = 1";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getActiveTasksCount() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT COUNT(id) as total FROM tasks WHERE `status` = 1";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getSentOrdersCount() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT COUNT(id) as total FROM orders WHERE `accepted` = 0";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getMonthInvoicesAmount() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT SUM(subTotal) as total FROM invoices WHERE status = 2 AND MONTH(date) = MONTH(NOW())";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }
    
    private function getMonthExpenses() {
        if ($this->get_request_method() != "GET") {
            $this->response('', 406);
        }
        if ($this->validateToken($this->getToken()) === false) {
            $this->response('', 401);
        }
        $query = "SELECT SUM(amount) as total FROM expenses WHERE MONTH(date) = MONTH(NOW())";
        $r = $this->mysqli->query($query) or die($this->mysqli->error . __LINE__);
        if ($r->num_rows > 0) {
            $result = array();
            while ($row = $r->fetch_assoc()) {
                $result[] = $row;
            }
            $success = array('status' => 1, "data" => $result);
            $this->response($this->json($success), 200); // send user details
        }
        $this->response('', 204); // If no records "No Content" status
    }

    /*
     * 	Encode array into JSON
     */

    private function json($data) {
        if (is_array($data)) {
            return json_encode($data);
        }
    }

}

// Initiiate Library

$api = new API;
$api->processApi();
//$api->test();
?>