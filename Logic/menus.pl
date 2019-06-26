%-----------------%
%-   Game Menu   -%
%-----------------%
	
mainMenu:-
	printMainMenu,
	read(Input),
	get_char(_),
	(
		(Input == 1, niJuHumanoHumano);
		(Input == 2, niJuHumanoComputadorNivel0);
		(Input == 3, niJuHumanoComputadorNivel1);
		(Input == 4, niJuComputadorNivel0ComputadorNivel0);
		(Input == 5, niJuComputadorNivel0ComputadorNivel1);
		(Input == 6, niJuComputadorNivel1ComputadorNivel1);
		(Input == 0, throw('Until next time!'));

		(nl,
		write('Error: invalid input.'), nl,
		pressEnterToContinue, nl,
		mainMenu)
	).

printMainMenu:-
	clearConsole,
	write('-------------------------------------------------'), nl,
	write('-                ..:: NI-JU ::..                -'), nl,
	write('-------------------------------------------------'), nl,
	write('-                                               -'), nl,
	write('-                    Play                       -'), nl,
	write('-   1. Player vs. Player                        -'), nl,
	write('-   2. Player vs. Computer(Nivel 0)             -'), nl,
	write('-   3. Player vs. Computer(Nivel 1)             -'), nl,
	write('-   4. Computer(Nivel 0) vs. Computer(Nivel 0)  -'), nl,
	write('-   5. Computer(Nivel 0) vs. Computer(Nivel 1)  -'), nl,
	write('-   6. Computer(Nivel 1) vs. Computer(Nivel 1)  -'), nl,
	write('-                                               -'), nl,
	write('-   0. Exit                                     -'), nl,
	write('-                                               -'), nl,
	write('-------------------------------------------------'), nl,
	write('Choose an option:'), nl.