#include "foo.h"
#include "bar.h"
#include <stdio.h>
#include "libtest.h"
int main(){
	printf("main start\n");
	foo();
	bar();
	hello_test();
	return 0;
}
