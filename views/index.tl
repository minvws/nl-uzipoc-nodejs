<html>
<head></head>
<body>
<div ${d.loggedIn == true ? '' : 'hidden'}>
    <a href="/logout">logout</a> <br />
    ${d.response}
</div>
<div ${d.loggedIn == true ? 'hidden' : ''}>
    <a href="/login">login</a>
</div>
</body>
</html>