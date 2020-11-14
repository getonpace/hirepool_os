# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

EmailAccessKey.create([
  { email: 'pdragunas@gmail.com', access_key: '11' },
  { email: 'ew@hirepool.io', access_key: '1' },
  { email: 'daniel@hirepool.io', access_key: '2' },
  { email: 'tom@hirepool.io', access_key: '3' },
  { email: 'brady@hirepool.io', access_key: '4' },
  { email: 'jofish@hirepool.io', access_key: '5' },
  { email: 'alison@hirepool.io', access_key: '6' },
  { email: 'farid@hirepool.io', access_key: '7' },
  { email: 'soulrider911@gmail.com', access_key: '8' },
  { email: 'alibee@gmail.com', access_key: '9' },
  { email: 'colin@hirepool.io', access_key: '10' },
  { email: 'test@hirepool.abcde', access_key: '11' }
])
