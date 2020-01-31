import os

class BaseConfig():
    TESTING = False
    DEBUG = False
    TASK_TIME_LIMIT = 30

    # Container settings
    CONTAINER_NAME = "safecontainer"


class DevConfig(BaseConfig):
    FLASK_ENV = 'development'
    DEBUG = True

    CELERY_BROKER_URL = 'pyamqp://guest@localhost//'
    CELERY_RESULT_BACKEND = 'rpc://'


class ProductionConfig(BaseConfig):
    FLASK_ENV = 'production'

    CELERY_BROKER = os.environ.get('RABBITMQ_BROKER')
    CELERY_RESULT_BACKEND = os.environ.get('RABBITMQ_RESULTS_BACKEND')


class TestConfig(BaseConfig):
    FLASK_ENV = 'development'
    TESTING = True
    DEBUG = True
    # make celery execute tasks synchronously in the same process
    CELERY_ALWAYS_EAGER = True
