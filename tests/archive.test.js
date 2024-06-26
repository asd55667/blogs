import test from 'ava'


import { Archive } from '../src/archive.js'

test('Archive', t => {
    const archive = new Archive()

    archive.add({ created: '2020-01-01' })

    t.is(archive.total, 1)
    t.is(archive.start, new Date('2020-01-01').getTime())
    t.is(archive.end, new Date('2020-01-01').getTime())
    t.is(archive.years, 1)
    t.is(archive.months, 1)
    t.is(archive.get(2020).total, 1)
    t.is(archive.get(2020).months[0].posts.length, 1)

    archive.add({ created: '2020-01-02' })

    t.is(archive.total, 2)
    t.is(archive.start, new Date('2020-01-01').getTime())
    t.is(archive.end, new Date('2020-01-02').getTime())
    t.is(archive.years, 1)
    t.is(archive.months, 1)
    t.is(archive.get(2020).total, 2)
    t.is(archive.get(2020).months[0].posts.length, 2)

    archive.add({ created: '2020-02-01' })

    t.is(archive.total, 3)
    t.is(archive.start, new Date('2020-01-01').getTime())
    t.is(archive.end, new Date('2020-02-01').getTime())
    t.is(archive.years, 1)
    t.is(archive.months, 2)
    t.is(archive.get(2020).total, 3)
    t.is(archive.get(2020).months[0].posts.length, 2)
    t.is(archive.get(2020).months[1].posts.length, 1)

    archive.add({ created: '2019-01-01' })
    t.is(archive.total, 4)
    t.is(archive.start, new Date('2019-01-01').getTime())
    t.is(archive.end, new Date('2020-02-01').getTime())
    t.is(archive.years, 2)
    t.is(archive.months, 3)
    t.is(archive.get(2020).total, 3)
    t.is(archive.get(2020).months[0].posts.length, 2)
    t.is(archive.get(2020).months[1].posts.length, 1)
    t.is(archive.get(2019).total, 1)
    t.is(archive.get(2019).months[0].posts.length, 1)


    archive.add({ created: '2019-01-01' })
    t.is(archive.total, 5)
    t.is(archive.start, new Date('2019-01-01').getTime())
    t.is(archive.end, new Date('2020-02-01').getTime())
    t.is(archive.years, 2)
    t.is(archive.months, 3)
    t.is(archive.get(2020).total, 3)
    t.is(archive.get(2020).months[0].posts.length, 2)
    t.is(archive.get(2020).months[1].posts.length, 1)
    t.is(archive.get(2019).total, 2)
    t.is(archive.get(2019).months[0].posts.length, 2)

    archive.add({ created: '2019-02-01' })
    t.is(archive.total, 6)
    t.is(archive.start, new Date('2019-01-01').getTime())
    t.is(archive.end, new Date('2020-02-01').getTime())
    t.is(archive.years, 2)
    t.is(archive.months, 4)
    t.is(archive.get(2020).total, 3)
    t.is(archive.get(2020).months[0].posts.length, 2)
    t.is(archive.get(2020).months[1].posts.length, 1)
    t.is(archive.get(2019).total, 3)
    t.is(archive.get(2019).months[0].posts.length, 2)
    t.is(archive.get(2019).months[1].posts.length, 1)
})