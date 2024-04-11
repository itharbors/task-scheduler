import { describe, it, before } from 'node:test';
import { equal } from 'node:assert';
import { TaskScheduler } from '../build/index.mjs';

const TASK = {
    a: {
        depends: [],
        execute: () => {
            console.log('execute a');
            return 'a';
        },
        revert: () => {
            console.log('revert a');
            return 'a';
        }
    },
    b: {
        depends: ['a'],
        execute: () => {
            console.log('execute b');
            return 'b';
        },
        revert: () => {
            console.log('revert b');
            return 'b';
        }
    },
};

describe('空队列数据检查', () => {
    const scheduler = new TaskScheduler();

    it('检查任务队列长度', () => {
        equal(0, scheduler.size);
    });
});

describe('调用 add 添加一个任务', () => {
    const scheduler = new TaskScheduler();
    scheduler.add('a', TASK.a);

    it('检查任务队列长度', () => {
        equal(1, scheduler.size);
    });
});

describe('调用 add 添加两个任务', () => {
    const scheduler = new TaskScheduler();
    scheduler.add('a', TASK.a);
    scheduler.add('b', TASK.b);

    it('检查任务队列长度', () => {
        equal(2, scheduler.size);
    });
});

describe('调用 add 重复添加任务', () => {
    const scheduler = new TaskScheduler();
    scheduler.add('a', TASK.a);
    scheduler.add('a', TASK.b);

    it('检查任务队列长度', () => {
        equal(1, scheduler.size);
    });
});

describe('调用 remove 在空队列里删除不存在的任务', () => {
    const scheduler = new TaskScheduler();
    scheduler.remove('a');

    it('检查任务队列长度', () => {
        equal(0, scheduler.size);
    });
});

describe('调用 remove 在有任务的队列里删除不存在的任务', () => {
    const scheduler = new TaskScheduler();
    scheduler.add('a', TASK.a);
    scheduler.remove('b');

    it('检查任务队列长度', () => {
        equal(1, scheduler.size);
    });
});

describe('调用 remove 删除任务', () => {
    const scheduler = new TaskScheduler();
    scheduler.add('a', TASK.a);
    scheduler.add('b', TASK.b);
    scheduler.remove('a');

    it('检查任务队列长度', () => {
        equal(1, scheduler.size);
    });
});

describe('调用 remove 删除唯一的任务', () => {
    const scheduler = new TaskScheduler();
    scheduler.add('a', TASK.a);
    scheduler.remove('a');

    it('检查任务队列长度', () => {
        equal(0, scheduler.size);
    });
});

describe('调用 remove 连续删除任务', () => {
    const scheduler = new TaskScheduler();
    scheduler.add('a', TASK.a);
    scheduler.add('b', TASK.b);
    scheduler.remove('a');
    scheduler.remove('b');

    it('检查任务队列长度', () => {
        equal(0, scheduler.size);
    });
});

describe('调用 execute 执行不存在的任务', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', {
        depends: [],
        execute: () => {
            return 'a';
        },
        revert: () => {
            return 'a';
        },
    });
    before(async () => {
        results = await scheduler.execute('b');
    });

    it('检查任务队列长度', () => {
        equal(1, scheduler.size);
    });

    it('检查结果长度', async () => {
        equal(0, results.length);
    });
});

describe('调用 execute 执行唯一任务', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', {
        depends: [],
        execute: () => {
            return 'a';
        },
        revert: () => {
            return 'a';
        },
    });
    before(async () => {
        results = await scheduler.execute('a');
    });

    it('检查任务队列长度', () => {
        equal(1, scheduler.size);
    });

    it('检查结果长度', async () => {
        equal(1, results.length);
    });

    it('检查返回结果名字', async () => {
        equal('a', results[0].name);
    });

    it('检查返回结果内容', async () => {
        equal('a', results[0].result);
    });
});

describe('调用 execute 重复执行唯一任务', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', {
        depends: [],
        execute: () => {
            return 'a';
        },
        revert: () => {
            return 'a';
        },
    });
    before(async () => {
        await scheduler.execute('a');
        results = await scheduler.execute('a');
    });

    it('检查任务队列长度', () => {
        equal(1, scheduler.size);
    });

    it('检查结果长度', async () => {
        // 第二次不执行
        equal(0, results.length);
    });
});

describe('调用 execute 执行不相关的任务', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', {
        depends: [],
        execute: () => {
            return 'a';
        },
        revert: () => {
            return 'a';
        },
    });
    scheduler.add('b', {
        depends: [],
        execute: () => {
            return 'a';
        },
        revert: () => {
            return 'a';
        },
    });
    before(async () => {
        results = await scheduler.execute('a');
    });

    it('检查任务队列长度', () => {
        equal(2, scheduler.size);
    });

    it('检查结果长度', async () => {
        equal(1, results.length);
    });

    it('检查返回结果名字', async () => {
        equal('a', results[0].name);
    });

    it('检查返回结果内容', async () => {
        equal('a', results[0].result);
        equal(void 0, results[0].error);
    });
});

describe('调用 execute 执行依赖任务', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', {
        depends: [],
        execute: () => {
            return 'a';
        },
        revert: () => {
            return 'a';
        },
    });
    scheduler.add('b', {
        depends: ['a'],
        execute: () => {
            return 'b';
        },
        revert: () => {
            return 'b';
        },
    });
    before(async () => {
        results = await scheduler.execute('a');
    });

    it('检查任务队列长度', () => {
        equal(2, scheduler.size);
    });

    it('检查结果长度', async () => {
        equal(2, results.length);
    });

    it('检查返回结果名字', async () => {
        equal('a', results[0].name);
        equal('b', results[1].name);
    });

    it('检查返回结果内容', async () => {
        equal('a', results[0].result);
        equal(void 0, results[0].error);
        equal('b', results[1].result);
        equal(void 0, results[1].error);
    });
});

describe('调用 execute 执行依赖任务时失败', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', {
        depends: [],
        execute: () => {
            throw 'a';
        },
        revert: () => {
            return 'a';
        },
    });
    scheduler.add('b', {
        depends: ['a'],
        execute: () => {
            return 'b';
        },
        revert: () => {
            return 'b';
        },
    });
    before(async () => {
        results = await scheduler.execute('a');
    });

    it('检查任务队列长度', () => {
        equal(2, scheduler.size);
    });

    it('检查结果长度', async () => {
        equal(1, results.length);
    });

    it('检查返回结果名字', async () => {
        equal('a', results[0].name);
    });

    it('检查返回结果内容', async () => {
        equal(void 0, results[0].result);
        equal('a', results[0].error);
    });
});

describe('调用 execute 执行任务后添加依赖任务', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', {
        depends: [],
        execute: () => {
            return 'a';
        },
        revert: () => {
            return 'a';
        },
    });
    before(async () => {
        await scheduler.execute('a');
        scheduler.add('b', {
            depends: ['a'],
            execute: () => {
                return 'b';
            },
            revert: () => {
                return 'b';
            },
        });
        results = await scheduler.execute('a');
    });

    it('检查任务队列长度', () => {
        equal(2, scheduler.size);
    });

    it('检查结果长度', async () => {
        // 因为 a 任务上一次已经执行完毕
        equal(0, results.length);
    });
});

describe('调用 checkDependExecuted 检查不存在的任务', async () => {
    let result;

    const scheduler = new TaskScheduler();
    before(async () => {
        result = scheduler.checkDependExecuted('a');
    });

    it('检查任务队列长度', () => {
        equal(0, scheduler.size);
    });

    it('检查结果', async () => {
        equal(false, result);
    });
});

describe('调用 checkDependExecuted 检查无依赖任务', async () => {
    let result;

    const scheduler = new TaskScheduler();
    scheduler.add('a', {
        depends: [],
        execute: () => {
            return 'a';
        },
        revert: () => {
            return 'a';
        },
    });
    before(async () => {
        result = scheduler.checkDependExecuted('a');
    });

    it('检查任务队列长度', () => {
        equal(1, scheduler.size);
    });

    it('检查结果', async () => {
        equal(false, result);
    });
});

describe('调用 checkDependExecuted 检查未执行的依赖任务', async () => {
    let result;

    const scheduler = new TaskScheduler();
    scheduler.add('a', {
        depends: [],
        execute: () => {
            return 'a';
        },
        revert: () => {
            return 'a';
        },
    });
    scheduler.add('b', {
        depends: ['a'],
        execute: () => {
            return 'b';
        },
        revert: () => {
            return 'b';
        },
    });
    before(async () => {
        // await scheduler.execute('a');
        result = scheduler.checkDependExecuted('b');
    });

    it('检查任务队列长度', () => {
        equal(2, scheduler.size);
    });

    it('检查结果', async () => {
        equal(false, result);
    });
});

describe('调用 checkDependExecuted 检查执行后的依赖任务', async () => {
    let result;

    const scheduler = new TaskScheduler();
    scheduler.add('a', {
        depends: [],
        execute: () => {
            return 'a';
        },
        revert: () => {
            return 'a';
        },
    });
    scheduler.add('b', {
        depends: ['a'],
        execute: () => {
            return 'b';
        },
        revert: () => {
            return 'b';
        },
    });
    before(async () => {
        await scheduler.execute('a');
        result = scheduler.checkDependExecuted('b');
    });

    it('检查任务队列长度', () => {
        equal(2, scheduler.size);
    });

    it('检查结果', async () => {
        equal(true, result);
    });
});

describe('调用 revert 重置不存在的任务', async () => {
    let results;

    const scheduler = new TaskScheduler();
    before(async () => {
        results = await scheduler.revert('a');
    });

    it('检查任务队列长度', () => {
        equal(0, scheduler.size);
    });

    it('检查结果长度', async () => {
        equal(0, results.length);
    });
});

describe('调用 revert 重置未执行的任务', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', TASK.a);
    before(async () => {
        results = await scheduler.revert('a');
    });

    it('检查任务队列长度', () => {
        equal(1, scheduler.size);
    });

    it('检查结果长度', async () => {
        equal(0, results.length);
    });
});

describe('调用 revert 重置任务报错', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', {
        depends: [],
        execute: () => {
            console.log('execute a');
            return 'a';
        },
        revert: () => {
            console.log('revert a');
            throw 'a';
        }
    });
    scheduler.add('b', {
        depends: ['a'],
        execute: () => {
            console.log('execute b');
            return 'b';
        },
        revert: () => {
            console.log('revert b');
            return 'b';
        }
    });
    before(async () => {
        await scheduler.execute('a');
        results = await scheduler.revert('a');
    });

    it('检查任务队列长度', () => {
        equal(2, scheduler.size);
    });

    it('检查结果长度', async () => {
        equal(1, results.length);
    });

    it('检查结果内容', async () => {
        equal('a', results[0].name);
        equal(void 0, results[0].result);
        equal('a', results[0].error);
    });
});

describe('调用 revert 重置无依赖的任务', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', TASK.a);
    before(async () => {
        await scheduler.execute('a');
        results = await scheduler.revert('a');
    });

    it('检查任务队列长度', () => {
        equal(1, scheduler.size);
    });

    it('检查结果长度', async () => {
        equal(1, results.length);
    });

    it('检查结果内容', async () => {
        equal('a', results[0].name);
        equal('a', results[0].result);
    });
});

describe('调用 revert 重置被依赖的任务 1', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', TASK.a);
    scheduler.add('b', TASK.b);
    before(async () => {
        await scheduler.execute('a');
        results = await scheduler.revert('a');
    });

    it('检查任务队列长度', () => {
        equal(2, scheduler.size);
    });

    it('检查结果长度', async () => {
        equal(2, results.length);
    });

    it('检查结果内容', async () => {
        equal('a', results[0].name);
        equal('a', results[0].result);
        equal('b', results[1].name);
        equal('b', results[1].result);
    });
});

describe('调用 revert 重置被依赖的任务 2', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', TASK.a);
    scheduler.add('b', TASK.b);
    before(async () => {
        await scheduler.execute('a');
        results = await scheduler.revert('b');
    });

    it('检查任务队列长度', () => {
        equal(2, scheduler.size);
    });

    it('检查结果长度', async () => {
        equal(1, results.length);
    });

    it('检查结果内容', async () => {
        equal('b', results[0].name);
        equal('b', results[0].result);
    });
});

describe('调用 revert 重置被依赖的任务 3', async () => {
    let results;

    const scheduler = new TaskScheduler();
    scheduler.add('a', TASK.a);
    scheduler.add('b', TASK.b);
    before(async () => {
        await scheduler.execute('a');
        await scheduler.revert('b');
        results = await scheduler.revert('a');
    });

    it('检查任务队列长度', () => {
        equal(2, scheduler.size);
    });

    it('检查结果长度', async () => {
        equal(1, results.length);
    });

    it('检查结果内容', async () => {
        equal('a', results[0].name);
        equal('a', results[0].result);
    });
});
