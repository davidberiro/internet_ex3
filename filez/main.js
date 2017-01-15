var LOGIN_USERNAME = 'admin';
var LOGIN_PASSWORD = 'admin';

var MSG_BOX_ID = 'msg_box';

var pageIds = ['login_page', 'main_page', 'calculator_page'];

var calculator;
// ----------------------- FUNCTIONS

var getBody = function () {
	return document.getElementsByTagName('body')[0];
};

var switchToPage = function (id) {
	// Hide all pages
	for (var i = 0; i < pageIds.length; i++) {
		document.getElementById(pageIds[i]).style.display = 'none';
	}
	document.getElementById(id).style.display = 'block';
};

var createLoginPage = function () {
	var div1 = document.createElement('div');
	div1.id = 'login_page';
	div1.className = 'login_page';
	getBody().appendChild(div1);

	var form = document.createElement('form');
	var user_str = document.createTextNode('Username: ');
	var pass_str = document.createTextNode('Password: ');

	var username_div = document.createElement('div');
	var password_div = document.createElement('div');

	var username_input = document.createElement('input');
	username_input.type = 'text';
	username_input.name = 'username';
	username_input.id = 'username';

	var password_input = document.createElement('input');
	password_input.type = 'text';
	password_input.name = 'password';
	password_input.id = 'password';

	var submit = document.createElement('input');
	submit.type = 'submit';
	submit.name = 'submit';
	submit.id = 'submit';

	header = document.createElement('h1');
	header.appendChild(document.createTextNode('Login'));
	form.appendChild(header);

	username_div.appendChild(user_str);
	username_div.appendChild(username_input);

	password_div.appendChild(pass_str);
	password_div.appendChild(password_input);

	form.appendChild(username_div);
	form.appendChild(password_div);

	form.appendChild(submit);

	div1.appendChild(form);

	form.onsubmit = function () {
		if (username_input.value == LOGIN_USERNAME && password_input.value == LOGIN_PASSWORD) {
			displayMessage('Login successful!', 4, true);
			switchToPage('main_page');
			return false;
		}
		displayMessage('Bad credentials. Try again.', 4, false);

		// Disables redirection after submitting the form (which is the default behaviour of the browser)
		return false;
	};
};

var createCalculatorPage = function () {
	var div3 = document.createElement('div');
	div3.id = 'calculator_page';
	div3.className = 'page';
	getBody().appendChild(div3);
	
	var header1 = document.createElement('h1');
	var add_button = document.createElement('button');
	add_button.appendChild(document.createTextNode('Add more calculators'));
	var calc_div = document.createElement('div');
	var calc_explanation = document.createTextNode("in order to use the calculator, type an arithmetic expression into the calculator input field, and the result will be displayed in the calculator output field");
	var header2 = document.createElement('h2');
	


	header2.appendChild(calc_explanation);
	div3.appendChild(header1);
	div3.appendChild(header2);
	div3.appendChild(calc_div);
	header1.appendChild(add_button);
	calc_div.appendChild(Calc());
	
	add_button.onclick = function() {
		calc_div.appendChild(Calc());
	}
};

var createMainPage = function () {
	var div2 = document.createElement('div');
	div2.id = 'main_page';
	div2.className = 'page'

	var header1 = document.createElement('h1');
	header1.appendChild(document.createTextNode('David Benchimol'));
	var header2 = document.createElement('h2');
	header2.appendChild(document.createTextNode('$$$ Dope-ass baby! $$$'));
	var marquee = document.createElement('marquee');
	var image_container = document.createElement('div');
	image_container.className = 'image-container';
	var my_image = document.createElement('img');
	my_image.src = 'pic.jpg';
	my_image.alt = "baby david";
	var img_p = document.createElement('p');
	img_p.innerHTML = "dat overbite tho";
	var bio_container = document.createElement('div');
	bio_container.className = "bio";
	var bio_p1 = document.createElement('p');
	bio_p1.innerHTML = "In case it isn't blatantly clear, my name is <em>David Benchimol.</em>";
	var bio_p2 = document.createElement('p');
	bio_p2.innerHTML = "Here are a few <em>hip</em> things about myself";
	var header3 = document.createElement('h3');
	header3.innerHTML = "A little about me";
	var bio_ul = document.createElement('ul');
	var list_elem1 = document.createElement('li');
	var list_elem2 = document.createElement('li');
	var list_elem3 = document.createElement('li');
	var link1 = document.createElement('a');
	link1.href = "https://www.chess.com/";
	link1.appendChild(document.createTextNode("over here"));
	var link2 = document.createElement('a');
	link2.href = "https://www.youtube.com/watch?v=vxEl7pwksWU";
	link2.appendChild(document.createTextNode("Ella & Louis"));
	var my_form = document.createElement('form');
	my_form.appendChild(document.createTextNode("ID: "));
	my_input = document.createElement('input');
	my_input.type = 'text';
	my_input.name = 'teudat zeehoot';
	my_input.value = '332510908';
	var calculator_button = document.createElement('button');
	calculator_button.appendChild(document.createTextNode('CALCULATOR BUTTON'));
	
	my_form.appendChild(my_input);
	
	bio_ul.appendChild(list_elem1);
	bio_ul.appendChild(list_elem2);
	bio_ul.appendChild(list_elem3);
	
	list_elem1.appendChild(document.createTextNode('My favorite way to waste time on the internet is '));
	list_elem1.appendChild(link1);
	list_elem2.appendChild(document.createTextNode('Some dope music: '));
	list_elem2.appendChild(link2);
	list_elem3.appendChild(document.createTextNode('Ummmm... More things?'));
	
	marquee.appendChild(header2);

	bio_container.appendChild(bio_p1);
	bio_container.appendChild(bio_p2);
	bio_container.appendChild(header3);
	bio_container.appendChild(bio_ul);
	bio_container.appendChild(my_form);
	bio_container.appendChild(calculator_button);
	
	div2.appendChild(header1);	
	div2.appendChild(marquee);
	div2.appendChild(image_container);
	div2.appendChild(bio_container);
	
	image_container.appendChild(my_image);
	image_container.appendChild(img_p);

	getBody().appendChild(div2);
	
	calculator_button.onclick = function(){
		switchToPage('calculator_page');
	}
};

var displayMessage = function (message, secondsToShow, success) {
	if (!(msgBox = document.getElementById(MSG_BOX_ID))) {
		msgBox = document.createElement('div');
		msgBox.id = MSG_BOX_ID;
		getBody().insertBefore(msgBox, getBody().firstChild);
	}
	msgBox.style.display = 'block';
	msgBox.innerHTML = '<p>' + message + '</p>';
	if (success) {
		msgBox.style.backgroundColor = "green";
	}
	else {
		msgBox.style.backgroundColor = "red";
	}

	setTimeout(hideMessageBox, secondsToShow * 1000);
};

var hideMessageBox = function () {
	if (msgBox = document.getElementById(MSG_BOX_ID)) {
		msgBox.style.display = 'none';
	}
};

var Calc = function() {
	var calculator = document.createElement('form');
	var input_str = document.createTextNode('calculator input: ');
	var output_str = document.createTextNode('calculator output: ');
	var input_div = document.createElement('div');
	var output_div = document.createElement('div');
	
	var calc_input = document.createElement('input');
	calc_input.type = 'text';
	calc_input.name = 'calculate';
	
	var calc_output = document.createElement('input');
	calc_input.type = 'text';
	calc_input.name = 'calculate';
	
	var calc_button = document.createElement('input');
	calc_button.type = 'submit';
	calc_button.value = 'calculate';
	calc_button.id = 'submit';
	
	calculator.appendChild(input_div);
	calculator.appendChild(output_div);
	calculator.appendChild(calc_button);
	input_div.appendChild(input_str);
	input_div.appendChild(calc_input);
	output_div.appendChild(output_str);
	output_div.appendChild(calc_output);
	
	calculator.onsubmit = function() {
		calc_output.value = eval(calc_input.value);
		return false;
	}
	
	return calculator;
}

var main = function () {
	createLoginPage();
	createMainPage();
	createCalculatorPage();

	switchToPage('login_page');
};

// ----------------------- END FUNCTIONS

main();


