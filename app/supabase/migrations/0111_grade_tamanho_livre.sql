-- Com a grade pela quantidade de quadrados, o quadrado pode ficar pequeno (100 quadrados numa
-- imagem de 1400 px = 14 px). A trava antiga (20 a 500 px) impedia de salvar.
alter table scenes drop constraint if exists scenes_grid_size_check;
alter table scenes add constraint scenes_grid_size_check check (grid_size between 1 and 10000);
