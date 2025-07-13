#ifndef STATE_TOP_DOWN_H
#define STATE_TOP_DOWN_H

#include <gbdk/platform.h>

void topdown_init(void) BANKED;
void topdown_update(void) BANKED;

extern UBYTE topdown_grid;

typedef struct script_collision_t {
    UBYTE script_bank;
    UBYTE *script_addr;
    UBYTE retrigger;
    UBYTE active;
} script_collision_t;

typedef struct script_end_collision_t {
    UBYTE script_bank;
    UBYTE *script_addr;
} script_end_collision_t;

#endif
