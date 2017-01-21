README for ex 3

David Benchimol & Basel Asad

1.) "What was hard in this exercise?"

Figuring out exactly what we had to implement and what we
didn't have to implement was probably one of the hardest parts,
and dealing with all the different cases and little details
that are easy to miss. If it wasn't for all the additional
information on the forum/facebook we would have been lost
for quite a while.

2.) "What was fun in this exercise?"

*awkward silence*

3.) "How did you test your server?"

We tested the server by running test.js and using the middleware
to open index.html from ex2, and making sure that the html css and js files
all managed to run. What was interesting was that the image from the html
file wasn't able to be loaded since res.send doesnt support buffers,
and the .jpeg file was too big to send to the socket all at once.