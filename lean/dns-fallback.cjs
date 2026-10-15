// Preloaded by `pnpm run wp-env`. wp-env decides it is offline when dns.resolve fails, and then
// skips installing WordPress. On machines where Node reads a dead DNS server (127.0.0.1 from a
// virtual adapter) while the OS resolver works, fall back to the OS resolver.
const dns = require( 'dns' );
const resolve = dns.promises.resolve;
dns.promises.resolve = ( host, ...rest ) =>
	resolve
		.call( dns.promises, host, ...rest )
		.catch( () =>
			dns.promises
				.lookup( host, { all: true } )
				.then( ( found ) => found.map( ( entry ) => entry.address ) )
		);
